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
    <aside className="relative flex h-full w-full flex-col glass p-3 sm:p-4 lg:p-4 lg:w-[280px]">
      {/* Close Button (Mobile) */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#94A3B8] active:scale-90 transition-transform z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="btn-gradient mb-3 sm:mb-4 lg:mb-5 flex h-10 sm:h-11 lg:h-12 items-center justify-center rounded-xl text-sm sm:text-base active:scale-95 transition-transform"
      >
        + New Chat
      </button>

      {/* Search Input */}
      <div className="relative mb-3 sm:mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search..."
          className="input-glass w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl px-3 sm:px-4 text-sm outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1">
        {pinnedChats.length > 0 && (
          <>
            <div className="px-2 sm:px-3 pt-3 sm:pt-4 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">Pinned</div>
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
            <div className="px-2 sm:px-3 pt-3 sm:pt-4 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">Recent</div>
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
          <div className="px-2 sm:px-3 py-6 sm:py-8 text-center text-sm text-[#64748B]">
            No conversations yet
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-3 sm:pt-4 mt-3 sm:mt-4">
        <button
          onClick={onSettings}
          className="input-glass flex w-full items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white active:bg-[rgba(212,175,55,0.15)] transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span className="text-xs sm:text-sm">Settings</span>
        </button>

        {/* User Profile */}
        <div className="input-glass flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-2 sm:p-3 mt-2 sm:mt-3">
          <div className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#3B82F6] text-xs sm:text-[14px] font-semibold text-white">
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
      className={`group relative flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-150 cursor-pointer active:bg-[rgba(255,255,255,0.05)] ${
        isActive
          ? 'bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-transparent border-l-[3px] border-[#D4AF37]'
          : 'hover:bg-[rgba(255,255,255,0.03)]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className={`truncate text-xs sm:text-sm font-medium ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>
          {chat.title}
        </div>
      </div>

      {/* Always visible actions on mobile */}
      <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          title="Pin chat"
          onClick={(e) => { e.stopPropagation(); onPin(chat); }}
          className="rounded-md p-1.5 text-[#64748B] hover:bg-[rgba(255,255,255,0.08)] hover:text-white active:bg-[rgba(255,255,255,0.12)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L12 22M12 2L8 6M12 2L16 6M8 6L4 10L8 14M16 6L20 10L16 14"/>
          </svg>
        </button>
        <button
          title="Delete chat"
          onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
          className="rounded-md p-1.5 text-[#64748B] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444] active:bg-[rgba(239,68,68,0.15)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}