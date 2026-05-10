import { Bot, Check, Copy, Pencil, RotateCcw, SendHorizontal, User, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { Message } from '../../types';
import { formatTime } from '../../lib/utils';
import { MarkdownMessage } from './MarkdownMessage';

export function MessageBubble({
  message,
  onEdit,
  onResend,
  onRetry
}: {
  message: Message;
  onEdit?: () => void;
  onResend?: () => void;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isUser = message.role === 'user';

  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <article className={`group flex w-full items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-message`}>
      <div
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1]'
            : 'bg-gradient-to-br from-[#D4AF37] to-[#22D3EE] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
        }`}
      >
        {isUser ? <User size={16} className="text-white" /> : <Bot size={18} className="text-white" />}
      </div>

      <div className={`flex min-w-0 max-w-[min(760px,calc(100%-52px))] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex min-h-5 items-center gap-2 text-xs text-[#64748B] ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-[#94A3B8]">{isUser ? 'You' : 'Cloudnest'}</span>
          <span>{message.pending ? 'Typing...' : formatTime(message.createdAt)}</span>
        </div>

        <div
          className={`w-full rounded-2xl border px-5 py-4 shadow-sm ${
            isUser
              ? 'message-user rounded-br-md border-transparent'
              : 'message-assistant rounded-bl-md'
          }`}
        >
        {!!message.attachments?.length && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.name} className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                {attachment.mimeType.startsWith('image/') && <img src={attachment.dataUrl} alt={attachment.name} className="max-h-56 w-full object-cover" />}
                {attachment.mimeType.startsWith('audio/') && <audio src={attachment.dataUrl} controls className="w-full" />}
                {attachment.mimeType.startsWith('video/') && <video src={attachment.dataUrl} controls className="max-h-64 w-full" />}
                <div className="truncate px-3 py-2 text-xs text-[#94A3B8]">{attachment.name}</div>
              </div>
            ))}
          </div>
        )}
        {message.pending && !message.content ? (
          <div className="flex min-h-6 items-center gap-1.5 py-1">
            <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-2 w-2 rounded-full bg-[#3B82F6] animate-bounce" style={{ animationDelay: '200ms' }}></span>
            <span className="h-2 w-2 rounded-full bg-[#22D3EE] animate-bounce" style={{ animationDelay: '400ms' }}></span>
          </div>
        ) : message.error ? (
          <div className="text-[#EF4444]">{message.content}</div>
        ) : (
          <MarkdownMessage content={message.content} />
        )}
        </div>

        
        <div className={`flex min-h-7 gap-1 text-[#64748B] opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <button
            title="Copy message"
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="rounded-lg p-1.5 hover:bg-[rgba(212,175,55,0.1)] hover:text-white"
          >
            {copied ? <Check size={15} className="text-[#10B981]" /> : <Copy size={15} />}
          </button>
          {!isUser && (
            <button
              title={speaking ? 'Stop reading' : 'Read aloud'}
              onClick={speak}
              className={`rounded-lg p-1.5 hover:bg-[rgba(212,175,55,0.1)] hover:text-white ${speaking ? 'text-[#D4AF37]' : ''}`}
            >
              <Volume2 size={15} />
            </button>
          )}
          {isUser && onEdit && (
            <button title="Edit message" onClick={onEdit} className="rounded-lg p-1.5 hover:bg-[rgba(212,175,55,0.1)] hover:text-white">
              <Pencil size={15} />
            </button>
          )}
          {isUser && onResend && (
            <button title="Send again" onClick={onResend} className="rounded-lg p-1.5 hover:bg-[rgba(212,175,55,0.1)] hover:text-white">
              <SendHorizontal size={15} />
            </button>
          )}
          {onRetry && (
            <button title="Retry generation" onClick={onRetry} className="rounded-lg p-1.5 hover:bg-[rgba(212,175,55,0.1)] hover:text-white">
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}