import type { Chat } from '../../types';

export function Sidebar({
  chats,
  activeChatId,
  activeView,
  search,
  onSearch,
  onNewChat,
  onSelect,
  onSettings,
  onDelete,
  onPin,
  onClose
}: {
  chats: Chat[];
  activeChatId?: string;
  activeView: 'chat' | 'settings';
  search: string;
  onSearch: (value: string) => void;
  onNewChat: () => void;
  onSelect: (chatId: string) => void;
  onSettings: () => void;
  onDelete: (chatId: string) => void;
  onPin: (chat: Chat) => void;
  onClose?: () => void;
}) {
  const pinnedChats = chats.filter(c => c.pinned);
  const recentChats = chats.filter(c => !c.pinned);

  return (
    <aside className="flex h-full w-full flex-col glass p-4 lg:w-[280px]">
      {/* Close Button (Mobile) */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#94A3B8]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="btn-gradient mb-5 flex h-12 items-center justify-center rounded-2xl text-[15px]"
      >
        New Chat
      </button>

      {/* Search Input */}
      <div className="relative mb-5">
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search conversations..."
          className="input-glass w-full h-11 rounded-2xl px-4 text-sm outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {pinnedChats.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">Pinned</div>
            {pinnedChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={activeView === 'chat' && activeChatId === chat._id}
                onSelect={onSelect}
                onDelete={onDelete}
                onPin={onPin}
              />
            ))}
          </>
        )}

        {recentChats.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">Recent</div>
            {recentChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={activeView === 'chat' && activeChatId === chat._id}
                onSelect={onSelect}
                onDelete={onDelete}
                onPin={onPin}
              />
            ))}
          </>
        )}

        {chats.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-[#64748B]">
            No conversations yet
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-4">
        <button
          onClick={onSettings}
          className="input-glass flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white"
        >
          Settings
        </button>

        {/* User Profile */}
        <div className="input-glass flex items-center gap-3 rounded-2xl p-3 mt-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#3B82F6] text-[14px] font-semibold text-white">
            CN
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Cloudnest</div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ChatItem({
  chat,
  isActive,
  onSelect,
  onDelete,
  onPin
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onPin: (chat: Chat) => void;
}) {
  return (
    <div
      onClick={() => onSelect(chat._id)}
      className={`group relative flex items-center gap-3 rounded-xl p-3 transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-transparent border-l-[3px] border-[#D4AF37]'
          : 'hover:bg-[rgba(255,255,255,0.03)]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-medium ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>
          {chat.title}
        </div>
        {chat.category && (
          <div className="truncate text-xs text-[#64748B]">{chat.category}</div>
        )}
      </div>

      {/* Hover Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          title="Pin chat"
          onClick={(e) => { e.stopPropagation(); onPin(chat); }}
          className="rounded-md p-1.5 text-[#64748B] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 22M12 2L8 6M12 2L16 6M8 6L4 10L8 14M16 6L20 10L16 14"/>
          </svg>
        </button>
        <button
          title="Delete chat"
          onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
          className="rounded-md p-1.5 text-[#64748B] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}