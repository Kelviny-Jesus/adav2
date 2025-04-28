/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
// Authentication and limit functionality
import { useState as useAuthState, useEffect as useAuthEffect } from 'react';
import { useMessageLimit } from '../../../hooks/use-message-limit';
import { useExportLimit } from '../../../hooks/use-export-limit';
import SubscriptionPlansPopup from './SubscriptionPlansPopup';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { APIKeyManager, getApiKeysFromCookies } from './APIKeyManager';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';

import styles from './BaseChat.module.scss';
import { ExportChatButton } from '~/components/chat/chatExportAndImport/ExportChatButton';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import GitCloneButton from './GitCloneButton';

import FilePreview from './FilePreview';
// ModelSelector removed as requested
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { SupabaseConnection } from '~/components/chat/SupabaseConnection';
import { SupabaseAlert } from '~/components/chat/SupabaseAlert';
import type { ProviderInfo } from '~/types/model';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { toast } from 'react-toastify';
import StarterTemplates from './StarterTemplates';
import type { ActionAlert } from '~/types/actions';
import ChatAlert from './ChatAlert';
import type { ModelInfo } from '~/lib/modules/llm/types';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '~/types/context';
import type { ActionRunner } from '~/lib/runtime/action-runner';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import '~/lib/stores/auth-profile'; // Initialize profile from auth data

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  data?: JSONValue[] | undefined;
  actionRunner?: ActionRunner;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      data,
      actionRunner,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    // API keys fixas para OpenAI (GPT-4.1) e Anthropic (Claude 3.7)
      const FIXED_API_KEYS: Record<string, string> = {
        Anthropic: 'api_here',
      };
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(FIXED_API_KEYS);
    const [modelList, setModelList] = useState<ModelInfo[]>([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    // Set Claude 3.7 as the default model
    useEffect(() => {
      // Find Anthropic provider in providerList
      const anthropicProvider = providerList?.find(p => p.name === 'Anthropic');
      if (anthropicProvider && setProvider) {
        setProvider(anthropicProvider);
      }
      
      // Set Claude 3.7 as the model
      if (setModel) {
        setModel('claude-3-7-sonnet-20250219');
      }
    }, [providerList, setProvider, setModel]);

    useEffect(() => {
      // Sempre sobrescrever as chaves para garantir que são as fixas
      setApiKeys(FIXED_API_KEYS);

      // Garantir que o cookie apiKeys está correto para o backend
      if (typeof window !== 'undefined') {
        Cookies.set('apiKeys', JSON.stringify(FIXED_API_KEYS), { path: '/' });

        setIsModelLoading('all');
        fetch('/api/models')
          .then((response) => response.json())
          .then((data) => {
            const typedData = data as { modelList: ModelInfo[] };
            setModelList(typedData.modelList);
          })
          .catch((error) => {
            console.error('Error fetching model list:', error);
          })
          .finally(() => {
            setIsModelLoading(undefined);
          });
      }
    }, [providerList, provider]);

    // Sobrescrever para nunca permitir alteração das chaves fixas
    const onApiKeysChange = async (_providerName: string, _apiKey: string) => {
      setApiKeys(FIXED_API_KEYS);
      // Não faz nada, pois as chaves são fixas
    };

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

  // Authentication state
  interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    role?: string;
    plan?: string;
    plan_status?: string;
  }
  
  const [user, setUser] = useAuthState<User | null>(null);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Load user data from localStorage on component mount
  useAuthEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, []);
  
  // Use the message and export limit hooks
  const {
    messageCount,
    monthlyLimit: messageMonthlyLimit,
    showLoginPrompt,
    showSubscriptionPlans: showMessageSubscriptionPlans,
    incrementMessageCount,
    resetMessageCount,
    closeLoginPrompt,
    closeSubscriptionPlans: closeMessageSubscriptionPlans,
    canSendMessage
  } = useMessageLimit(isAuthenticated, user);
  
  // Use the export limit hook
  const {
    exportCount,
    monthlyLimit: exportMonthlyLimit,
    showSubscriptionPlans: showExportSubscriptionPlans,
    incrementExportCount,
    resetExportCount,
    closeSubscriptionPlans: closeExportSubscriptionPlans,
    canExport
  } = useExportLimit(isAuthenticated, user);
  
  // Use only message subscription plans popup in BaseChat
  const showSubscriptionPlans = showMessageSubscriptionPlans;
  
  // Close only message subscription plans popup in BaseChat
  const closeSubscriptionPlans = () => {
    closeMessageSubscriptionPlans();
  };

  const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
    // Check if user can send a message
    if (!canSendMessage) {
      // Show login prompt or subscription plans popup if message limit is reached
      incrementMessageCount();
      return;
    }

    // Check if this message would exceed the limit
    const canSend = incrementMessageCount();
    if (!canSend) {
      return;
    }

    if (sendMessage) {
      sendMessage(event, messageInput);

      if (recognition) {
        recognition.abort(); // Stop current recognition
        setTranscript(''); // Clear transcript
        setIsListening(false);

        // Clear the input by triggering handleInputChange with empty value
        if (handleInputChange) {
          const syntheticEvent = {
            target: { value: '' }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          handleInputChange(syntheticEvent);
        }
      }
    }
  };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        
        {/* Subscription plans popup */}
        <SubscriptionPlansPopup 
          isOpen={showSubscriptionPlans} 
          onClose={closeSubscriptionPlans} 
        />
        
        {/* Login prompt modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800">
              <button 
                onClick={closeLoginPrompt} 
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <div className="i-ph:x text-xl"></div>
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-4">Message Limit Reached</h2>
              
              <p className="text-gray-300 mb-6">
                {isAuthenticated ? 
                  `You've reached the limit of ${messageMonthlyLimit} messages for your current plan (${user?.plan || 'Free'}).
                  Upgrade your plan to send more messages this month.` :
                  `You've reached the limit of messages for non-registered users. 
                  Sign in or create an account to continue using Ada without limitations.`
                }
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => window.location.href = "/login"}
                  className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md"
                >
                  Sign In
                </button>
                
                <button
                  onClick={() => window.location.href = "/register"}
                  className="w-full bg-transparent hover:bg-gray-800 text-white border border-gray-700 py-2 rounded-md"
                >
                  Create Account
                </button>
                
                <button
                  onClick={closeLoginPrompt}
                  className="w-full bg-transparent text-gray-400 hover:text-white py-2"
                >
                  Continue with Limited Access
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Login/logout button moved to bottom right */}
        <div ref={scrollRef} className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <div id="intro" className="mt-[16vh] max-w-chat mx-auto text-center px-4 lg:px-0">
                <h1 className="text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in">
                  Create your world
                </h1>
                <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                  Bring ideas to life in seconds or get help on existing projects.
                </p>
              </div>
            )}
            <div
              className={classNames('pt-6 px-2 sm:px-6', {
                'h-full flex flex-col': chatStarted,
              })}
              ref={scrollRef}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('flex flex-col gap-4 w-full max-w-chat mx-auto z-prompt mb-6', {
                  'sticky bottom-2': chatStarted,
                })}
              >
                <div className="bg-bolt-elements-background-depth-2">
                  {actionAlert && (
                    <ChatAlert
                      alert={actionAlert}
                      clearAlert={() => clearAlert?.()}
                      postMessage={(message) => {
                        sendMessage?.({} as any, message);
                        clearAlert?.();
                      }}
                    />
                  )}
                  <SupabaseAlert />
                </div>
                {progressAnnotations && <ProgressCompilation data={progressAnnotations} />}
                <div
                  className={classNames(
                    'bg-bolt-elements-background-depth-2 p-3 rounded-lg border border-bolt-elements-borderColor relative w-full max-w-chat mx-auto z-prompt',

                    /*
                     * {
                     *   'sticky bottom-2': chatStarted,
                     * },
                     */
                  )}
                >
                  <svg className={classNames(styles.PromptEffectContainer)}>
  <defs>
    <linearGradient
      id="line-gradient"
      x1="20%"
      y1="0%"
      x2="-14%"
      y2="10%"
      gradientUnits="userSpaceOnUse"
      gradientTransform="rotate(-45)"
    >
      <stop offset="0%" stopColor="#1E40AF" stopOpacity="0%" /> {/* Azul escuro */}
      <stop offset="40%" stopColor="#1E40AF" stopOpacity="80%" />
      <stop offset="50%" stopColor="#3B82F6" stopOpacity="80%" /> {/* Azul médio */}
      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0%" />
    </linearGradient>
    <linearGradient id="shine-gradient">
      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0%" /> {/* Azul claro */}
      <stop offset="40%" stopColor="#60A5FA" stopOpacity="80%" />
      <stop offset="50%" stopColor="#60A5FA" stopOpacity="80%" />
      <stop offset="100%" stopColor="#60A5FA" stopOpacity="0%" />
    </linearGradient>
  </defs>
  <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round"></rect>
  <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1"></rect>
</svg>
                  {/* Model selector removed - Claude 3.7 is fixed */}
                  <FilePreview
                    files={uploadedFiles}
                    imageDataList={imageDataList}
                    onRemove={(index) => {
                      setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
                      setImageDataList?.(imageDataList.filter((_, i) => i !== index));
                    }}
                  />
                  <ClientOnly>
                    {() => (
                      <ScreenshotStateManager
                        setUploadedFiles={setUploadedFiles}
                        setImageDataList={setImageDataList}
                        uploadedFiles={uploadedFiles}
                        imageDataList={imageDataList}
                      />
                    )}
                  </ClientOnly>
                  <div
                    className={classNames(
                      'relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg',
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      className={classNames(
                        'w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
                        'transition-all duration-200',
                        'hover:border-bolt-elements-focus',
                      )}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.border = '2px solid #1488fc';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.border = '2px solid #1488fc';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';

                        const files = Array.from(e.dataTransfer.files);
                        files.forEach((file) => {
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();

                            reader.onload = (e) => {
                              const base64Image = e.target?.result as string;
                              setUploadedFiles?.([...uploadedFiles, file]);
                              setImageDataList?.([...imageDataList, base64Image]);
                            };
                            reader.readAsDataURL(file);
                          }
                        });
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          if (event.shiftKey) {
                            return;
                          }

                          event.preventDefault();

                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          // ignore if using input method engine
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          handleSendMessage?.(event);
                        }
                      }}
                      value={input}
                      onChange={(event) => {
                        handleInputChange?.(event);
                      }}
                      onPaste={handlePaste}
                      style={{
                        minHeight: TEXTAREA_MIN_HEIGHT,
                        maxHeight: TEXTAREA_MAX_HEIGHT,
                      }}
                      placeholder="How can Ada help you today?"
                      translate="no"
                    />
                    <ClientOnly>
                      {() => (
                        <SendButton
                          show={input.length > 0 || isStreaming || uploadedFiles.length > 0}
                          isStreaming={isStreaming}
                          disabled={!providerList || providerList.length === 0}
                          onClick={(event) => {
                            if (isStreaming) {
                              handleStop?.();
                              return;
                            }

                            if (input.length > 0 || uploadedFiles.length > 0) {
                              handleSendMessage?.(event);
                            }
                          }}
                        />
                      )}
                    </ClientOnly>
                    <div className="flex justify-between items-center text-sm p-4 pt-2">
                      <div className="flex gap-1 items-center">
                        <IconButton title="Upload file" className="transition-all" onClick={() => handleFileUpload()}>
                          <div className="i-ph:paperclip text-xl"></div>
                        </IconButton>
                        <IconButton
                          title="Enhance prompt"
                          disabled={input.length === 0 || enhancingPrompt}
                          className={classNames('transition-all', enhancingPrompt ? 'opacity-100' : '')}
                          onClick={() => {
                            enhancePrompt?.();
                            toast.success('Prompt enhanced!');
                          }}
                        >
                          {enhancingPrompt ? (
                            <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl animate-spin"></div>
                          ) : (
                            <div className="i-bolt:stars text-xl"></div>
                          )}
                        </IconButton>

                        <SpeechRecognitionButton
                          isListening={isListening}
                          onStart={startListening}
                          onStop={stopListening}
                          disabled={isStreaming}
                        />
                        {chatStarted && <ClientOnly>{() => {
                          // Only show export button for non-free users
                          const userData = localStorage.getItem("userData");
                          let userPlan = 'free';
                          if (userData) {
                            try {
                              const parsedUserData = JSON.parse(userData);
                              userPlan = parsedUserData.plan?.toLowerCase() || 'free';
                            } catch (error) {
                              console.error("Error parsing user data:", error);
                            }
                          }
                          
                          // Don't show export button for free users
                          return userPlan !== 'free' ? <ExportChatButton exportChat={exportChat} /> : null;
                        }}</ClientOnly>}
                        <SupabaseConnection />
                        {/* Model settings button hidden as requested */}
                      </div>
                      {input.length > 3 ? (
                        <div className="text-xs text-bolt-elements-textTertiary">
                          Use <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Shift</kbd>{' '}
                          + <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Return</kbd>{' '}
                          a new line
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-5">
              {!chatStarted && (
                <div className="flex justify-center gap-2">
                  {ImportButtons(importChat)}
                  <GitCloneButton importChat={importChat} />
                </div>
              )}
              {!chatStarted &&
                ExamplePrompts((event, messageInput) => {
                  if (isStreaming) {
                    handleStop?.();
                    return;
                  }

                  handleSendMessage?.(event, messageInput);
                })}
              {!chatStarted && <StarterTemplates />}
            </div>
          </div>
          <ClientOnly>
            {() => (
              <Workbench
                actionRunner={actionRunner ?? ({} as ActionRunner)}
                chatStarted={chatStarted}
                isStreaming={isStreaming}
              />
            )}
          </ClientOnly>
        </div>
        
        {/* Login/logout button at bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          {isAuthenticated ? (
            <button
              onClick={() => {
                // Log out functionality
                localStorage.removeItem("userData");
                setUser(null);
                resetMessageCount();
                localStorage.removeItem("messageCount");
                // Also clear profile data
                localStorage.removeItem("bolt_profile");
                window.location.href = "/";
              }}
              className="bg-[#1a2b4c] hover:bg-[#1f3461] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg"
            >
              <div className="i-ph:arrow-right text-sm"></div>
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => window.location.href = "/login"}
              className="bg-[#1a2b4c] hover:bg-[#1f3461] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg"
            >
              <div className="i-ph:sign-in text-sm"></div>
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);
