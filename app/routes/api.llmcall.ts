import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { streamText } from '~/lib/.server/llm/stream-text';
import type { IProviderSetting, ProviderInfo } from '~/types/model';
import { generateText } from 'ai';
import { PROVIDER_LIST } from '~/utils/constants';
import { MAX_TOKENS } from '~/lib/.server/llm/constants';
import { LLMManager } from '~/lib/modules/llm/manager';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { getApiKeysFromCookie, getProviderSettingsFromCookie } from '~/lib/api/cookies';
import { createScopedLogger } from '~/utils/logger';

export async function action(args: ActionFunctionArgs) {
  return llmCallAction(args);
}

async function getModelList(options: {
  apiKeys?: Record<string, string>;
  providerSettings?: Record<string, IProviderSetting>;
  serverEnv?: Record<string, string>;
}) {
  const llmManager = LLMManager.getInstance(import.meta.env);
  return llmManager.updateModelList(options);
}

const logger = createScopedLogger('api.llmcall');

async function llmCallAction({ context, request }: ActionFunctionArgs) {
  const { system, message, model, provider, streamOutput } = await request.json<{
    system: string;
    message: string;
    model: string;
    provider: ProviderInfo;
    streamOutput?: boolean;
  }>();

  const { name: providerName } = provider;

  // validate 'model' and 'provider' fields
  if (!model || typeof model !== 'string') {
    throw new Response('Invalid or missing model', {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  if (!providerName || typeof providerName !== 'string') {
    throw new Response('Invalid or missing provider', {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = getApiKeysFromCookie(cookieHeader);
  const providerSettings = getProviderSettingsFromCookie(cookieHeader);

  if (streamOutput) {
    try {
      const result = await streamText({
        options: {
          system,
        },
        messages: [
          {
            role: 'user',
            content: `${message}`,
          },
        ],
        env: context.cloudflare?.env as any,
        apiKeys,
        providerSettings,
      });

      return new Response(result.textStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof Error && error.message?.includes('API key')) {
        throw new Response('Invalid or missing API key', {
          status: 401,
          statusText: 'Unauthorized',
        });
      }

      throw new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  } else {
    try {
      const models = await getModelList({ apiKeys, providerSettings, serverEnv: context.cloudflare?.env as any });
      const modelDetails = models.find((m: ModelInfo) => m.name === model);

      if (!modelDetails) {
        throw new Error('Model not found');
      }

      const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;

      const providerInfo = PROVIDER_LIST.find((p) => p.name === provider.name);

      if (!providerInfo) {
        throw new Error('Provider not found');
      }

      logger.info(`Generating response Provider: ${provider.name}, Model: ${modelDetails.name}`);

      try {
        const result = await generateText({
          system,
          messages: [
            {
              role: 'user',
              content: `${message}`,
            },
          ],
          model: providerInfo.getModelInstance({
            model: modelDetails.name,
            serverEnv: context.cloudflare?.env as any,
            apiKeys,
            providerSettings,
          }),
          maxTokens: dynamicMaxTokens,
          toolChoice: 'none',
        });
        
        // Log raw result for debugging
        logger.info(`Raw result: ${JSON.stringify(result)}`);
        logger.info(`Raw usage: ${JSON.stringify(result.usage)}`);
        
        // Force token usage to be calculated
        const tokenUsage = {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0
        };
        
        // For OpenAI, if tokens are still null, try to estimate them
        if (provider.name === 'OpenAI' && 
            (tokenUsage.promptTokens === 0 || tokenUsage.completionTokens === 0)) {
          // Rough estimation based on token count (1 token ≈ 4 characters)
          const promptChars = (system?.length || 0) + (message?.length || 0);
          const responseChars = result.text?.length || 0;
          
          tokenUsage.promptTokens = tokenUsage.promptTokens || Math.ceil(promptChars / 4);
          tokenUsage.completionTokens = tokenUsage.completionTokens || Math.ceil(responseChars / 4);
          tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
          
          logger.info(`Estimated token usage for OpenAI: ${JSON.stringify(tokenUsage)}`);
        }
        
        logger.info(`Final token usage: ${JSON.stringify(tokenUsage)}`);

        return new Response(JSON.stringify({
          ...result,
          usage: tokenUsage
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error: any) {
        // Check for rate limit errors
        if (error.message?.includes('rate limit') || error.statusCode === 429) {
          logger.error(`Rate limit exceeded: ${error.message}`);
          return new Response(JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'You have exceeded the rate limit for this model. Please try again later or switch to a different model.',
            details: error.message
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
        
        // Re-throw other errors
        throw error;
      }
    } catch (error: unknown) {
      console.log(error);

      if (error instanceof Error && error.message?.includes('API key')) {
        throw new Response('Invalid or missing API key', {
          status: 401,
          statusText: 'Unauthorized',
        });
      }

      throw new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }
}
