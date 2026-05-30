import { Layout } from '@/components/layout/Layout';
import { CodePreview } from '@/components/CodePreview';
import { useGenerate } from '@/hooks/useGenerate';
import { UIStyle, UITheme, UIFramework } from '@aiuix/shared';

const STYLES: { value: UIStyle; label: string; desc: string }[] = [
  { value: 'minimal',       label: 'Minimal',       desc: 'Clean & spacious' },
  { value: 'glassmorphism', label: 'Glass',         desc: 'Frosted blur' },
  { value: 'neumorphic',    label: 'Neumorphic',    desc: 'Soft shadows' },
  { value: 'brutalist',     label: 'Brutalist',     desc: 'Bold & raw' },
  { value: 'material',      label: 'Material',      desc: 'Google MD3' },
];

const THEMES: { value: UITheme; label: string }[] = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark',  label: '🌙 Dark' },
  { value: 'auto',  label: '⚙️ Auto' },
];

const FRAMEWORKS: { value: UIFramework; label: string }[] = [
  { value: 'react', label: 'React' },
  { value: 'html',  label: 'HTML' },
  { value: 'vue',   label: 'Vue 3' },
];

const EXAMPLE_PROMPTS = [
  'A pricing table with 3 tiers: Free, Pro, and Enterprise',
  'A login form with social auth buttons and remember me',
  'A dashboard stat card row showing revenue, users, and growth',
  'A file upload dropzone with progress bar and file list',
];

export const GeneratePage = () => {
  const { form, setField, result, loading, error, generate, reset } = useGenerate();

  return (
    <Layout>
      <div className="flex h-full">
        {/* ── Left: Form Panel ── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-[var(--border)] overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-lg font-bold tracking-tight">Generate UI</h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Describe a component, get production code</p>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                Prompt
              </label>
              <textarea
                value={form.prompt}
                onChange={e => setField('prompt', e.target.value)}
                placeholder="A pricing table with 3 tiers..."
                rows={4}
                className="input-base w-full p-3 rounded-lg text-sm resize-none leading-relaxed"
              />
              {/* Example prompts */}
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Examples</p>
                {EXAMPLE_PROMPTS.map(ex => (
                  <button
                    key={ex}
                    onClick={() => { setField('prompt', ex); reset(); }}
                    className="w-full text-left text-xs text-[var(--text-muted)] hover:text-violet-300 px-2 py-1.5 rounded hover:bg-violet-600/10 transition-all truncate"
                  >
                    → {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setField('style', s.value)}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all border ${
                      form.style === s.value
                        ? 'bg-violet-600/15 border-violet-600/40 text-violet-300'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-violet-600/20 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{s.label}</span>
                    <span className="text-[10px] opacity-60">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Framework</label>
              <div className="flex gap-1.5">
                {FRAMEWORKS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setField('framework', f.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      form.framework === f.value
                        ? 'bg-violet-600/15 border-violet-600/40 text-violet-300'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Theme</label>
              <div className="flex gap-1.5">
                {THEMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setField('theme', t.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      form.theme === t.value
                        ? 'bg-violet-600/15 border-violet-600/40 text-violet-300'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color hint */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                Color hint <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.colorScheme}
                onChange={e => setField('colorScheme', e.target.value)}
                placeholder="e.g. indigo and amber, forest green"
                className="input-base w-full h-10 px-3 rounded-lg text-sm"
              />
            </div>

            {/* Generate button */}
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}
            <button
              onClick={generate}
              disabled={loading || form.prompt.length < 10}
              className="btn-primary w-full h-11 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Right: Result Panel ── */}
        <div className="flex-1 p-5 flex flex-col min-h-0">
          {result ? (
            <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[var(--text-muted)]">
                  Generated {new Date(result.generatedAt).toLocaleTimeString()}
                </span>
                <button
                  onClick={reset}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ← New generation
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <CodePreview result={result} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {loading ? (
                <div className="space-y-4 animate-fade-up">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center mx-auto">
                    <span className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin block" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-300">Generating your UI…</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">This takes 5–15 seconds</p>
                  </div>
                  {/* Shimmer placeholders */}
                  <div className="w-80 space-y-2 mt-4">
                    {[100, 80, 90, 60].map((w, i) => (
                      <div key={i} className={`h-3 rounded animate-shimmer`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    Fill in the form and click <span className="text-violet-300 font-medium">Generate</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
