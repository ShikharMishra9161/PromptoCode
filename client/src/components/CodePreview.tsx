import { useState } from 'react';
import { GenerateUIResponseDTO } from '@aiuix/shared';

interface Props { result: GenerateUIResponseDTO }

export const CodePreview = ({ result }: Props) => {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // For HTML preview — wrap in minimal iframe doc
  const previewDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body{margin:0;font-family:sans-serif;}</style>
</head>
<body>${result.code}</body>
</html>`;

  return (
    <div className="flex flex-col h-full border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex gap-1">
          {(['code', 'preview'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {result.tokensUsed.toLocaleString()} tokens
          </span>
          <button
            onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation bar */}
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-violet-900/10 flex-shrink-0">
        <p className="text-xs text-violet-300/80 leading-relaxed">{result.explanation}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'code' ? (
          <pre className="mono text-xs text-[#c9d1d9] p-4 h-full overflow-auto leading-relaxed">
            <code>{result.code}</code>
          </pre>
        ) : (
          <iframe
            title="UI Preview"
            srcDoc={previewDoc}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
};
