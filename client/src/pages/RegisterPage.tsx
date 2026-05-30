import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-700/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">AIUIX</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Start generating UI in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {[
            { label: 'Full name', value: name, set: setName, type: 'text', placeholder: 'Shikhar Mishra' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '8+ chars, 1 uppercase, 1 number' },
          ].map(field => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                required
                className="input-base w-full h-11 px-4 rounded-lg text-sm"
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full h-11 rounded-lg text-sm mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent-bright)] hover:text-white transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
