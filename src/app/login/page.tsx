'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = tab === 'login'
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      localStorage.setItem('spendwise_user', JSON.stringify({
        name: data.name,
        email: data.email
      }));

      if (tab === 'signup' || !data.onboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/api/auth/google' });
    } catch {
      setError('Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] flex flex-col justify-center px-6">
      <div className="w-full max-w-sm mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary">SpendWise 💰</h1>
          <p className="text-on-surface-variant mt-2">Your smart money sidekick ✨</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-surface-variant/40 rounded-full p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); setShowPassword(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'login' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); setShowPassword(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {tab === 'signup' && (
            <div>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-on-surface"
              />
              <p className="text-[11px] text-on-surface-variant mt-1 px-1">
                Letters only, 2–50 characters
              </p>
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-on-surface"
          />

          {/* Password with show/hide */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-on-surface"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {tab === 'signup' && (
              <p className="text-[11px] text-on-surface-variant mt-1 px-1">
                At least 6 characters, with a letter and a number
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password || (tab === 'signup' && !name)}
          className="w-full mt-5 py-4 bg-primary text-white font-bold rounded-full active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'Please wait...' : tab === 'login' ? 'Log in →' : 'Create account →'}
        </button>

        {tab === 'login' && (
          <p className="text-center mt-4 text-sm text-primary font-semibold cursor-pointer">
            Forgot password?
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-outline-variant/50" />
          <span className="text-xs text-on-surface-variant">or</span>
          <div className="flex-1 h-px bg-outline-variant/50" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3.5 border border-outline-variant bg-white rounded-full font-semibold text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm disabled:opacity-60"
        >
          {googleLoading ? (
            <span className="text-on-surface-variant">Redirecting to Google...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

      </div>
    </div>
  );
}