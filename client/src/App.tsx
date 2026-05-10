import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { Composer } from './components/chat/Composer';
import { MessageBubble } from './components/chat/MessageBubble';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { Sidebar } from './components/sidebar/Sidebar';
import { Toast } from './components/ui/toast';
import { createChat, createMessage, deleteChat, deleteModel, fetchChat, fetchChats, fetchModels, saveModel, streamAssistant, updateChat } from './lib/api';
import { useAppStore } from './stores/appStore';
import type { Attachment, Message, ModelCapability, ModelConfig } from './types';

type ModelType = 'text-to-text' | 'text-to-image' | 'vision' | 'embeddings' | 'audio' | 'multimodal';

function modelConfigForType(modelType: ModelType): Pick<ModelConfig, 'capabilities' | 'endpointType'> {
  const config: Record<ModelType, Pick<ModelConfig, 'capabilities' | 'endpointType'>> = {
    'text-to-text': { capabilities: ['text'], endpointType: 'chat' },
    'text-to-image': { capabilities: ['text', 'images'], endpointType: 'image' },
    vision: { capabilities: ['text', 'images', 'multimodal'], endpointType: 'vision' },
    embeddings: { capabilities: ['embeddings'], endpointType: 'embedding' },
    audio: { capabilities: ['text', 'audio'], endpointType: 'audio' },
    multimodal: { capabilities: ['text', 'images', 'audio', 'video', 'multimodal'], endpointType: 'multimodal' }
  };

  return config[modelType];
}

// Add ambient background and grid pattern to the app
const AmbientBackground = () => (
  <>
    <div className="ambient-bg">
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>
    </div>
    <div className="grid-pattern"></div>
  </>
);

export default function App() {
  const queryClient = useQueryClient();
  const { selectedModelId, theme, setSelectedModelId } = useAppStore();
  const { canInstall, install } = useInstallPrompt();
  const [activeChatId, setActiveChatId] = useState<string>();
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'settings'>('chat');
  const [editingMessage, setEditingMessage] = useState<Message>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const streamFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const modelsQuery = useQuery({ queryKey: ['models'], queryFn: fetchModels });
  const chatsQuery = useQuery({ queryKey: ['chats', search], queryFn: () => fetchChats(search) });
  const chatQuery = useQuery({
    queryKey: ['chat', activeChatId],
    queryFn: () => fetchChat(activeChatId!),
    enabled: !!activeChatId
  });

  useEffect(() => {
    if (chatQuery.data?.messages) setMessages(chatQuery.data.messages);
  }, [chatQuery.data]);

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current);
    };
  }, []);

  const selectedModel = useMemo(
    () => modelsQuery.data?.find((model) => model.modelId === selectedModelId) || modelsQuery.data?.[0],
    [modelsQuery.data, selectedModelId]
  );

  useEffect(() => {
    if (!modelsQuery.data?.length) return;
    if (!modelsQuery.data.some((model) => model.modelId === selectedModelId)) {
      setSelectedModelId(modelsQuery.data[0].modelId);
    }
  }, [modelsQuery.data, selectedModelId, setSelectedModelId]);

  const newChatMutation = useMutation({
    mutationFn: () => createChat(selectedModelId),
    onSuccess: (chat) => {
      setActiveChatId(chat._id);
      setActiveView('chat');
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSidebarOpen(false);
    }
  });

  const sendMessage = async (content: string, attachments: Attachment[], replaceMessage?: Message) => {
    const chat = activeChatId ? undefined : await createChat(selectedModelId);
    const chatId = activeChatId || chat!._id;
    if (!activeChatId) setActiveChatId(chatId);

    const userMessage: Message = {
      chatId,
      role: 'user',
      content,
      modelId: selectedModelId,
      attachments,
      createdAt: new Date().toISOString()
    };
    const optimisticAssistant: Message = {
      chatId,
      role: 'assistant',
      content: '',
      modelId: selectedModelId,
      pending: true,
      createdAt: new Date().toISOString()
    };

    if (replaceMessage) {
      setMessages((current) => {
        const replaceIndex = current.findIndex((message) => message === replaceMessage || message._id === replaceMessage._id);
        if (replaceIndex === -1) return [...current, userMessage, optimisticAssistant];
        return [...current.slice(0, replaceIndex), userMessage, optimisticAssistant];
      });
    } else {
      setMessages((current) => [...current, userMessage, optimisticAssistant]);
    }
    await createMessage(userMessage);

    try {
      let bufferedContent = '';
      let pendingTokenBuffer = '';
      let lastFlush = 0;
      const flushStream = () => {
        if (!pendingTokenBuffer) {
          streamFrameRef.current = undefined;
          return;
        }

        bufferedContent += pendingTokenBuffer;
        pendingTokenBuffer = '';
        lastFlush = performance.now();
        setMessages((current) =>
          current.map((message, index) =>
            index === current.length - 1
              ? { ...message, pending: false, content: bufferedContent }
              : message
          )
        );
        streamFrameRef.current = undefined;
      };

      await streamAssistant({
        chatId,
        modelId: selectedModelId,
        messages: [...messages, userMessage],
        attachments,
        onToken: (token) => {
          pendingTokenBuffer += token;
          const elapsed = performance.now() - lastFlush;
          if (!streamFrameRef.current) {
            streamFrameRef.current = requestAnimationFrame(() => {
              if (elapsed < 48 && pendingTokenBuffer.length < 80) {
                streamFrameRef.current = requestAnimationFrame(flushStream);
                return;
              }
              flushStream();
            });
          }
        }
      });
      flushStream();
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'The stream failed. Please retry.';
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? { ...message, pending: false, error: 'Stream failed', content: message.content || errorMessage }
            : message
        )
      );
      setToast(errorMessage);
    }
  };

  const chats = chatsQuery.data || [];

  return (
    <div className="min-h-screen p-0 text-foreground" style={{ background: 'linear-gradient(145deg, #050816 0%, #0B1020 50%, #0a0f1a 100%)' }}>
      <AmbientBackground />
      <div className="relative flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            activeView={activeView}
            search={search}
            onSearch={setSearch}
            onNewChat={() => newChatMutation.mutate()}
            onSelect={(id) => {
              setActiveChatId(id);
              setActiveView('chat');
            }}
            onSettings={() => setActiveView('settings')}
            onDelete={(id) => deleteChat(id).then(() => queryClient.invalidateQueries({ queryKey: ['chats'] }))}
            onPin={(chat) => updateChat(chat._id, { pinned: !chat.pinned }).then(() => queryClient.invalidateQueries({ queryKey: ['chats'] }))}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
              >
                <Sidebar
                  chats={chats}
                  activeChatId={activeChatId}
                  activeView={activeView}
                  search={search}
                  onSearch={setSearch}
                  onNewChat={() => newChatMutation.mutate()}
                  onSelect={(id) => {
                    setActiveChatId(id);
                    setActiveView('chat');
                    setSidebarOpen(false);
                  }}
                  onSettings={() => {
                    setActiveView('settings');
                    setSidebarOpen(false);
                  }}
                  onDelete={(id) => deleteChat(id).then(() => queryClient.invalidateQueries({ queryKey: ['chats'] }))}
                  onPin={(chat) => updateChat(chat._id, { pinned: !chat.pinned }).then(() => queryClient.invalidateQueries({ queryKey: ['chats'] }))}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.08)] glass px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {activeView === 'settings' ? (
                <button
                  onClick={() => setActiveView('chat')}
                  className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#94A3B8] active:scale-95 transition-transform"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#94A3B8] active:scale-95 transition-transform"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                  </svg>
                </button>
              )}
              {activeView === 'chat' && (
                <select
                  value={selectedModelId}
                  onChange={(event) => setSelectedModelId(event.target.value)}
                  className="input-glass h-9 max-w-[45vw] sm:max-w-[140px] rounded-lg sm:rounded-xl border-[rgba(255,255,255,0.08)] bg-transparent px-2 sm:px-3 text-xs sm:text-sm font-medium text-white outline-none hover:border-[rgba(255,255,255,0.12)] cursor-pointer"
                  title="Select model"
                >
                  {(modelsQuery.data || []).map((model) => (
                    <option key={model.modelId} value={model.modelId} className="bg-[#0B1020]">
                      {model.label}
                    </option>
                  ))}
                </select>
              )}
              {activeView === 'settings' && (
                <span className="text-sm font-medium text-white">Settings</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeView === 'chat' && (
                <button
                  onClick={() => setActiveView('settings')}
                  className="hidden lg:flex input-glass h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#94A3B8] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                  </svg>
                  Settings
                </button>
              )}
            <button
              onClick={install}
              disabled={!canInstall}
              className={`input-glass flex h-9 items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 text-xs sm:text-sm font-medium active:scale-95 transition-transform ${
                canInstall
                  ? 'text-[#94A3B8] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white'
                  : 'text-[#64748B] opacity-50 cursor-not-allowed'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              <span className="hidden sm:inline">Add to Homescreen</span>
            </button>
            </div>
          </header>
          {activeView === 'settings' ? (
            <section className="min-h-0 flex-1 overflow-y-auto">
              <SettingsPanel
                models={modelsQuery.data || []}
                onAddModel={async (modelId, modelType, previousModelId) => {
                  const modelRoute = modelConfigForType(modelType);
                  const model = await saveModel({
                    modelId,
                    label: modelId,
                    capabilities: modelRoute.capabilities as ModelCapability[],
                    endpointType: modelRoute.endpointType
                  });
                  if (previousModelId && previousModelId !== modelId) {
                    await deleteModel(previousModelId);
                  }
                  setSelectedModelId(model.modelId);
                  await queryClient.invalidateQueries({ queryKey: ['models'] });
                  setToast('Model added to settings.');
                }}
                onDeleteModel={async (modelId) => {
                  await deleteModel(modelId);
                  await queryClient.invalidateQueries({ queryKey: ['models'] });
                  if (modelId === selectedModelId) {
                    const remainingModels = modelsQuery.data?.filter((model) => model.modelId !== modelId) || [];
                    setSelectedModelId(remainingModels[0]?.modelId || '');
                  }
                  setToast('Model deleted.');
                }}
              />
            </section>
          ) : (
            <>
              <section
                className="min-h-0 flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-4"
                onScroll={(event) => {
                  const target = event.currentTarget;
                  shouldStickToBottomRef.current = target.scrollHeight - target.scrollTop - target.clientHeight < 96;
                }}
              >
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 sm:gap-4 pt-4 sm:pt-10">
                  {!messages.length && (
                    <div className="grid min-h-[40vh] sm:min-h-[50vh] place-items-center text-center">
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl animate-fade-in px-4">
                        <h2 className="gradient-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">How can I help you today?</h2>
                        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#94A3B8]">
                          Cloudnest AI is ready to assist with any task. Start a conversation below.
                        </p>
                        <div className="mt-8 sm:mt-12 flex gap-3 sm:gap-4 text-left flex-wrap justify-center max-w-[900px]">
                          {[
                            { icon: 'edit', title: 'Write creative content', desc: 'Blog posts, stories, marketing copy' },
                            { icon: 'code', title: 'Debug code', desc: 'Find and fix errors in any language' },
                            { icon: 'help', title: 'Explain complex topics', desc: 'Learn anything in simple terms' }
                          ].map((item, index) => (
                            <button
                              key={item.title}
                              onClick={() => sendMessage(item.title, [])}
                              className={`card-hover input-glass min-w-[240px] sm:min-w-[260px] flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left stagger-${index + 1} active:scale-95 transition-transform`}
                            >
                              <div className="flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[rgba(212,175,55,0.2)]">
                                {item.icon === 'edit' && (
                                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                  </svg>
                                )}
                                {item.icon === 'code' && (
                                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                  </svg>
                                )}
                                {item.icon === 'help' && (
                                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="text-sm sm:text-[15px] font-medium text-white">{item.title}</div>
                                <div className="text-xs sm:text-[13px] text-[#64748B]">{item.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                  {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <MessageBubble
                        key={`${message._id || index}`}
                        message={message}
                        onEdit={isUser ? () => setEditingMessage(message) : undefined}
                        onResend={isUser ? () => sendMessage(message.content, message.attachments || []) : undefined}
                        onRetry={index === messages.length - 1 ? () => sendMessage('Please retry the last answer.', []) : undefined}
                      />
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </section>
              <footer className="mx-auto w-full max-w-4xl px-2 sm:px-6 pb-3 sm:pb-7 pt-2 sm:pt-0 shrink-0">
                <Composer
                  model={selectedModel}
                  disabled={messages.at(-1)?.pending}
                  initialContent={editingMessage?.content || ''}
                  onCancelEdit={() => setEditingMessage(undefined)}
                  onSubmit={(content, attachments) => {
                    void sendMessage(content, attachments.length ? attachments : editingMessage?.attachments || [], editingMessage);
                    setEditingMessage(undefined);
                  }}
                />
              </footer>
            </>
          )}
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
