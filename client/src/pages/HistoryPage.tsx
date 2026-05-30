import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useHistory } from '@/hooks/useHistory';
import { IHistory } from '@aiuix/shared';

const STYLE_COLORS: Record<string, string> = {
  minimal:       'bg-slate-500/15 text-slate-300 border-slate-500/20',
  glassmorphism: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  neumorphic:    'bg-purple-500/15 text-purple-300 border-purple-500/20',
  brutalist:     'bg-orange-500/15 text-orange-300 border-orange-500/20',
  material:      'bg-blue-500/15 text-blue-300 border-blue-500/20',
};

const FW_LABEL: Record<string, string> = { react: 'React', html: 'HTML', vue: 'Vue 3' };

const HistoryCard = ({
  item, onDelete, onFav, onExpand,
}: {
  item: IHistory;
  onDelete: () => void;
  onFav: () => void;
  onExpand: () => void;
}) => (
  <div className="glass rounded-xl p-4 flex flex-col gap-3 hover:border-violet-600/20 transition-all group animate-fade-up">
    {/* Top row */}
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{item.prompt}</p>
      <button onClick={onFav} className="flex-shrink-0 mt-0.5 transition-all hover:scale-110">
        {item.isFavorite
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        }
      </button>
    </div>

    {/* Badges */}
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STYLE_COLORS[item.style] ?? 'bg-white/5 text-white/50 border-white/10'}`}>
        {item.style}
      </span>
      <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full">
        {FW_LABEL[item.framework]}
      </span>
      <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full">
        {item.theme}
      </span>
    </div>

    {/* Explanation */}
    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{item.explanation}</p>

    {/* Footer */}
    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
      <span className="text-[10px] text-[var(--text-muted)]">
        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onExpand}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-violet-600/15 text-violet-300 hover:bg-violet-600/25 transition-all"
        >
          View code
        </button>
        <button
          onClick={onDelete}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Code modal ──────────────────────────────────────────────
const CodeModal = ({ item, onClose }: { item: IHistory; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(item.generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border)] flex-shrink-0">
          <p className="text-sm font-semibold truncate flex-1 pr-4">{item.prompt}</p>
          <div className="flex items-center gap-2">
            <button onClick={copy} className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${copied ? 'bg-emerald-600/20 text-emerald-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'}`}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <pre className="mono text-xs text-[#c9d1d9] p-5 overflow-auto flex-1 leading-relaxed">
          <code>{item.generatedCode}</code>
        </pre>
      </div>
    </div>
  );
};

// ── Page ────────────────────────────────────────────────────
export const HistoryPage = () => {
  const { items, total, page, loading, favOnly, setFavOnly, fetch, remove, toggleFav, LIMIT } = useHistory();
  const [expanded, setExpanded] = useState<IHistory | null>(null);
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Generation History</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} component{total !== 1 ? 's' : ''} generated</p>
          </div>
          <button
            onClick={() => setFavOnly(f => !f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              favOnly
                ? 'bg-violet-600/15 border-violet-600/40 text-violet-300'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={favOnly ? '#a78bfa' : 'none'} stroke={favOnly ? '#a78bfa' : 'currentColor'} strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Favorites
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{favOnly ? 'No favorites yet' : 'No generations yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <HistoryCard
                key={item._id}
                item={item}
                onDelete={() => remove(item._id)}
                onFav={() => toggleFav(item._id)}
                onExpand={() => setExpanded(item)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => fetch(page - 1)}
              className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-violet-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-xs text-[var(--text-muted)] px-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => fetch(page + 1)}
              className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-violet-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {expanded && <CodeModal item={expanded} onClose={() => setExpanded(null)} />}
    </Layout>
  );
};
