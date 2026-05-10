import { Mic, Paperclip, SendHorizontal, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fileToDataUrl } from '../../lib/utils';
import type { Attachment, ModelConfig } from '../../types';

export function Composer({
  model,
  disabled,
  initialContent = '',
  onCancelEdit,
  onSubmit
}: {
  model?: ModelConfig;
  disabled?: boolean;
  initialContent?: string;
  onCancelEdit?: () => void;
  onSubmit: (content: string, attachments: Attachment[]) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supportsFiles = model?.capabilities.some((capability) => ['images', 'audio', 'video', 'multimodal'].includes(capability));

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '40px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  }, [content]);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const next = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: await fileToDataUrl(file)
      }))
    );
    setAttachments((current) => [...current, ...next]);
  };

  const startVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const baseContent = content.trim();
    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setContent(`${baseContent} ${transcript}`.trim());
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
  };

  return (
    <form
      className="input-glass rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 focus-within:border-[#D4AF37] focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_3px_rgba(212,175,55,0.15)]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (supportsFiles) void addFiles(event.dataTransfer.files);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!content.trim() && !attachments.length) return;
        onSubmit(content, attachments);
        setContent('');
        setAttachments([]);
        onCancelEdit?.();
      }}
    >
      {/* Editing Indicator */}
      {initialContent && (
        <div className="mx-3 sm:mx-4 mt-2 sm:mt-3 mb-1 flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-2 text-xs text-[#94A3B8]">
          <span>Editing message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md px-2 py-1 hover:bg-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Attachments */}
      {!!attachments.length && (
        <div className="mb-2 flex gap-2 overflow-x-auto px-3 sm:px-4 pt-2">
          {attachments.map((attachment) => (
            <div key={attachment.name} className="relative min-w-36 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2 text-xs">
              <button
                type="button"
                title="Remove attachment"
                onClick={() => setAttachments((items) => items.filter((item) => item.name !== attachment.name))}
                className="absolute right-1 top-1 rounded-full bg-[rgba(255,255,255,0.1)] p-1 text-[#64748B] hover:text-white"
              >
                <X size={12} />
              </button>
              {attachment.mimeType.startsWith('image/') && (
                <img src={attachment.dataUrl} alt="" className="mb-2 h-20 w-full rounded-lg object-cover" />
              )}
              <div className="truncate pr-5 text-[#94A3B8]">{attachment.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex gap-1">
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(event) => void addFiles(event.target.files)}
          />
          <button
            type="button"
            title="Attach files"
            disabled={!supportsFiles}
            onClick={() => fileRef.current?.click()}
            className="input-glass flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl text-[#64748B] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white disabled:opacity-40"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            title={listening ? 'Stop voice input' : 'Voice input'}
            onClick={listening ? stopVoice : startVoice}
            className={`input-glass flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl transition-all ${
              listening
                ? 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.3)]'
                : 'text-[#64748B] hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] hover:text-white'
            }`}
          >
            {listening ? <Square className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Message..."
          className="min-h-[36px] sm:min-h-[40px] flex-1 resize-none overflow-y-auto border-none bg-transparent py-1.5 sm:py-2 text-sm sm:text-[15px] leading-5 sm:leading-6 text-white outline-none placeholder:text-[#64748B]"
        />

        <button
          type="submit"
          disabled={disabled || (!content.trim() && !attachments.length)}
          className="btn-gradient flex h-9 sm:h-10 w-9 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          <SendHorizontal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Input Footer - Hidden on mobile */}
      <div className="hidden sm:block pb-3 text-center">
        <span className="text-[12px] text-[#64748B]">
          Press <kbd className="mx-1 rounded bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[11px]">Enter</kbd> to send,
          <kbd className="mx-1 rounded bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[11px]">Shift + Enter</kbd> for new line
        </span>
      </div>
    </form>
  );
}