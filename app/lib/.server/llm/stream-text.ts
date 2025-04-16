import { convertToCoreMessages, streamText as _streamText, type Message } from 'ai';
import { MAX_TOKENS, type FileMap } from './constants';
import { getSystemPrompt } from '~/lib/common/prompts/prompts';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, MODIFICATIONS_TAG_NAME, PROVIDER_LIST, WORK_DIR } from '~/utils/constants';
import type { IProviderSetting } from '~/types/model';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { allowedHTMLElements } from '~/utils/markdown';
import { LLMManager } from '~/lib/modules/llm/manager';
import { createScopedLogger } from '~/utils/logger';
import { createFilesContext, extractPropertiesFromMessage } from './utils';
import { getFilePaths } from './select-context';

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

const logger = createScopedLogger('stream-text');

export async function streamText(props: {
  messages: Omit<Message, 'id'>[];
  env?: Env;
  options?: StreamingOptions;
  apiKeys?: Record<string, string>;
  files?: FileMap;
  providerSettings?: Record<string, IProviderSetting>;
  promptId?: string;
  contextOptimization?: boolean;
  contextFiles?: FileMap;
  summary?: string;
  messageSliceId?: number;
}) {
  const {
    messages,
    env: serverEnv,
    options,
    apiKeys,
    files,
    providerSettings,
    promptId,
    contextOptimization,
    contextFiles,
    summary,
  } = props;
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER.name;
  let processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);
      currentModel = model;
      currentProvider = provider;

      return { ...message, content };
    } else if (message.role == 'assistant') {
      let content = message.content;
      content = content.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, '');
      content = content.replace(/<think>.*?<\/think>/s, '');

      return { ...message, content };
    }

    return message;
  });

  // Forçar o uso do provedor Anthropic
  const provider = PROVIDER_LIST.find((p) => p.name === 'Anthropic') || DEFAULT_PROVIDER;
  const staticModels = LLMManager.getInstance().getStaticModelListFromProvider(provider);
  let modelDetails = staticModels.find((m) => m.name === currentModel);

  if (!modelDetails) {
    const modelsList = [
      ...(provider.staticModels || []),
      ...(await LLMManager.getInstance().getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv: serverEnv as any,
      })),
    ];

    if (!modelsList.length) {
      throw new Error(`No models found for provider ${provider.name}`);
    }

    modelDetails = modelsList.find((m) => m.name === currentModel);

    if (!modelDetails) {
      // Fallback to first model
      logger.warn(
        `MODEL [${currentModel}] not found in provider [${provider.name}]. Falling back to first model. ${modelsList[0].name}`,
      );
      modelDetails = modelsList[0];
    }
  }

  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;

  let systemPrompt =
    PromptLibrary.getPropmtFromLibrary(promptId || 'default', {
      cwd: WORK_DIR,
      allowedHtmlElements: allowedHTMLElements,
      modificationTagName: MODIFICATIONS_TAG_NAME,
    }) ?? getSystemPrompt();

  if (files && contextFiles && contextOptimization) {
    const codeContext = createFilesContext(contextFiles, true);
    const filePaths = getFilePaths(files);

    systemPrompt = `${systemPrompt}
Below are all the files present in the project:
---
${filePaths.join('\n')}
---

Below is the artifact containing the context loaded into context buffer for you to have knowledge of and might need changes to fullfill current user request.
CONTEXT BUFFER:
---
${codeContext}
---
`;

    if (summary) {
      systemPrompt = `${systemPrompt}
      below is the chat history till now
CHAT SUMMARY:
---
${props.summary}
---
`;

      if (props.messageSliceId) {
        processedMessages = processedMessages.slice(props.messageSliceId);
      } else {
        const lastMessage = processedMessages.pop();

        if (lastMessage) {
          processedMessages = [lastMessage];
        }
      }
    }
  }

  logger.info(`Sending llm call to ${provider.name} with model ${modelDetails.name}`);

  try {
    const result = await _streamText({
      model: provider.getModelInstance({
        model: modelDetails.name,
        serverEnv,
        apiKeys,
        providerSettings,
      }),
      system: systemPrompt,
      maxTokens: dynamicMaxTokens,
      messages: convertToCoreMessages(processedMessages as any),
      ...options,
    });
    
    // Log token usage if available
    result.usage.then(usage => {
      // Log raw usage for debugging
      logger.info(`Raw usage from stream: ${JSON.stringify(usage)}`);
      
      if (usage) {
        const tokenUsage = {
          promptTokens: usage.promptTokens || 0,
          completionTokens: usage.completionTokens || 0,
          totalTokens: usage.totalTokens || 0
        };
        
        // For OpenAI, if tokens are still null, try to estimate them
        if (provider.name === 'OpenAI' && 
            (tokenUsage.promptTokens === 0 || tokenUsage.completionTokens === 0)) {
          // Rough estimation based on token count (1 token ≈ 4 characters)
          const promptChars = systemPrompt.length + 
            processedMessages.reduce((sum, msg) => sum + (typeof msg.content === 'string' ? msg.content.length : 0), 0);
          
          // We can't know the response length yet since it's streaming, so use a reasonable estimate
          const estimatedResponseChars = 1000; 
          
          tokenUsage.promptTokens = tokenUsage.promptTokens || Math.ceil(promptChars / 4);
          tokenUsage.completionTokens = tokenUsage.completionTokens || Math.ceil(estimatedResponseChars / 4);
          tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
          
          logger.info(`Estimated token usage for OpenAI stream: ${JSON.stringify(tokenUsage)}`);
        }
        
        logger.info(`Stream completed. Token usage: ${JSON.stringify(tokenUsage)}`);
      }
    }).catch(err => {
      logger.warn(`Failed to get token usage: ${err.message}`);
    });
    
    return result;
  } catch (error: any) {
    // Check for rate limit errors
    if (error.message?.includes('rate limit') || error.statusCode === 429) {
      logger.error(`Rate limit exceeded: ${error.message}`);
      
      // Create a readable stream with an error message
      const encoder = new TextEncoder();
      const errorMessage = "ERROR: Rate limit exceeded. Please try again later or switch to a different model.";
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      });
      
      return {
        textStream: stream,
        usage: Promise.resolve({ promptTokens: 0, completionTokens: 0, totalTokens: 0 })
      };
    }
    
    // Re-throw other errors
    throw error;
  }
}
