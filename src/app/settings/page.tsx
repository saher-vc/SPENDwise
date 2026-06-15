'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency, currencies } from '@/lib/currency';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  budget: number;
  savingsGoal: number;
  goalName: string;
  persona: string;
  currency: string;
  points: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/dashboard');
    if (res.status === 401) { router.push('/login'); return; }
    const data = await res.json();
    setUser({
      name: data.stats.userName,
      email: data.user.email,
      budget: data.stats.budget,
      savingsGoal: data.stats.savingsGoal,
      goalName: data.stats.goalName,
      persona: data.stats.persona,
      currency: data.stats.currency ?? 'PKR',
      points: data.user.points ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const updateUser = async (fields: Partial<UserData>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, ...fields } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!user) return;
    const newBudget = prompt(`Enter new monthly budget (${user.currency}):`, user.budget.toString());
    if (!newBudget || isNaN(Number(newBudget)) || Number(newBudget) <= 0) return;
    await updateUser({ budget: Number(newBudget) });
    alert('Budget updated!');
  };

  const handleUpdateGoal = async () => {
    if (!user) return;
    const newGoal = prompt(`Enter new savings goal (${user.currency}):`, user.savingsGoal.toString());
    if (!newGoal || isNaN(Number(newGoal))) return;
    const newGoalName = prompt('What are you saving for?', user.goalName) || user.goalName;
    await updateUser({ savingsGoal: Number(newGoal), goalName: newGoalName });
    alert('Savings goal updated!');
  };

  const handleCurrencyChange = async (code: string) => {
    setShowCurrencyPicker(false);
    await updateUser({ currency: code });
    alert(`Currency changed to ${code}! Refresh pages to see updated amounts.`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary transition-colors
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
        after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );

  const personaEmoji: Record<string, string> = {
    student: '🎓', professional: '💼', freelancer: '💻'
  };

  const currentCurrency = currencies.find(c => c.code === (user?.currency ?? 'PKR'));

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] text-on-surface pb-24">

      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-5 py-3">
          <h1 className="font-bold text-xl text-primary">SpendWise</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chatbot')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/50"
            >
              <span className="material-symbols-outlined text-on-surface-variant">forum</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {loading ? '?' : user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5 space-y-4">

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Settings</h2>
          <p className="text-on-surface-variant text-sm">Customize your financial experience</p>
        </div>

        {/* Profile */}
        <section className="bg-white border border-outline-variant/30 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {loading ? '?' : user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{loading ? 'Loading...' : user?.name}</h3>
              <p className="text-sm text-on-surface-variant">{user?.email}</p>
              {user?.persona && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
                  {personaEmoji[user.persona]} {user.persona}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-container/20 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-xs text-on-surface-variant">Total Points</p>
                <p className="font-bold text-primary">{user?.points ?? 0} pts</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/challenges')}
              className="text-xs text-primary font-bold"
            >
              View Challenges →
            </button>
          </div>
        </section>

        {/* Currency */}
        <section className="bg-white border border-outline-variant/30 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💱</span>
            <h3 className="text-lg font-bold">Currency</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-3">
            All amounts will display in your selected currency.
          </p>
          <button
            onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
            className="w-full flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentCurrency?.flag}</span>
              <div>
                <p className="font-bold">{currentCurrency?.code}</p>
                <p className="text-xs text-on-surface-variant">{currentCurrency?.name}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              {showCurrencyPicker ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showCurrencyPicker && (
            <div className="mt-2 border border-outline-variant/30 rounded-2xl overflow-hidden">
              {currencies.map((c, i) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant/20 transition-colors ${
                    i < currencies.length - 1 ? 'border-b border-outline-variant/20' : ''
                  } ${user?.currency === c.code ? 'bg-primary-container/30' : ''}`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">{c.code}</p>
                    <p className="text-xs text-on-surface-variant">{c.name}</p>
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant">{c.symbol}</span>
                  {user?.currency === c.code && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Budgeting */}
        <section className="bg-white border border-outline-variant/30 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💰</span>
            <h3 className="text-lg font-bold">Budgeting</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl">
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Monthly Budget</p>
              <p className="font-bold text-primary text-lg">
                {loading ? '...' : formatCurrency(user?.budget ?? 0, user?.currency)}
              </p>
            </div>
            <button
              onClick={handleUpdateBudget}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl">
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Savings Goal</p>
              <p className="font-bold text-primary text-lg">
                {loading ? '...' : formatCurrency(user?.savingsGoal ?? 0, user?.currency)}
              </p>
              <p className="text-xs text-gray-500">{user?.goalName}</p>
            </div>
            <button
              onClick={handleUpdateGoal}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white border border-outline-variant/30 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎨</span>
            <h3 className="text-lg font-bold">Appearance</h3>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-variant/30 rounded-xl"
          >
            <span className="text-sm font-medium">Dark Mode</span>
            <span className="material-symbols-outlined text-primary">
              {darkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </section>

        {/* Notifications */}
        <section className="bg-white border border-outline-variant/30 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-2xl mb-1 block">🔔</span>
            <h3 className="text-lg font-bold">Notifications</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>

      </main>
      <BottomNav />
    </div>
  );
}