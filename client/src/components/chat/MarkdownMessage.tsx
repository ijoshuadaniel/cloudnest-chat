import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-slate-900 px-3 text-xs text-slate-300">
        <span className="font-medium uppercase tracking-wide">{language || 'code'}</span>
        <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-white/10">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={atomOneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{ margin: 0, padding: '16px', background: 'transparent', fontSize: '13px' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  const tokens = marked.lexer(content || '');
  return (
    <div className="min-h-6 space-y-3 text-sm leading-6 text-[#e2e8f0]">
      {tokens.map((token, index) => {
        if (token.type === 'code') {
          return <CodeBlock key={index} language={token.lang} code={token.text} />;
        }
        return (
          <div
            key={index}
            className="prose prose-sm max-w-none text-[#e2e8f0]"
            dangerouslySetInnerHTML={{ __html: marked.parser([token]) }}
          />
        );
      })}
    </div>
  );
}
