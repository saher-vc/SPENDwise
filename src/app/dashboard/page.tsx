'use client';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/currency";

interface DashboardStats {
  totalSpent: number;
  remaining: number;
  dailyAvg: number;
  budget: number;
  savingsGoal: number;
  goalName: string;
  percentUsed: number;
  userName: string;
  persona: string;
  currency: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const moods = ['😢', '🙂', '😊', '😍', '🎉'];

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setStats(data.stats);
        setExpenses(data.expenses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
    setTimeout(() => setSelectedMood(null), 300);
  };

  const categoryIcons: Record<string, string> = {
    food: 'restaurant',
    transport: 'directions_car',
    shopping: 'shopping_bag',
    health: 'favorite',
    education: 'school',
    entertainment: 'movie',
  };

  const categoryColors: Record<string, string> = {
    food: 'bg-orange-50 text-orange-600',
    transport: 'bg-gray-100 text-gray-800',
    shopping: 'bg-purple-50 text-purple-600',
    health: 'bg-red-50 text-red-600',
    education: 'bg-blue-50 text-blue-600',
    entertainment: 'bg-pink-50 text-pink-600',
  };

  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const personaEmoji: Record<string, string> = {
    student: '🎓',
    professional: '💼',
    freelancer: '💻',
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-2xl">😕</p>
        <p className="text-on-surface-variant text-center">Could not load your data. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-full font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-surface font-body text-on-surface antialiased pb-32">

      {/* Top App Bar */}
      <header className="bg-surface sticky top-0 z-40">
        <div className="flex justify-between items-center px-5 py-4 w-full">
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl text-primary tracking-tight">
              👋 Hey, {stats.userName || 'there'}!
            </h1>
            <span className="text-on-surface-variant text-sm font-medium">
              📆 {monthName}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/chatbot')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-on-surface-variant">forum</span>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-5 space-y-6 mt-2">

        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 text-on-primary shadow-xl">
          <div className="relative z-10 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase opacity-80">
                💰 LEFT TO SPEND
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold tracking-tighter">
                  {formatCurrency(stats.remaining, stats.currency)}
                </span>
                <span className="text-xl opacity-70">/ {formatCurrency(stats.budget, stats.currency)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
                />
              </div>
              <p className="text-sm font-medium opacity-90 italic">
                {formatCurrency(stats.totalSpent, stats.currency)} spent · {stats.percentUsed}% used
              </p>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </section>

        {/* Persona Badge */}
        {stats.persona && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-full py-3 px-6 shadow-sm">
            <span className="text-xl">
              {personaEmoji[stats.persona] ?? '👤'}
            </span>
            <p className="text-sm font-semibold text-blue-800 capitalize">
              {stats.persona} · managing budget wisely
            </p>
          </div>
        )}

        {/* Mini Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-surface-variant/50">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                TRACK
              </span>
            </div>
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Daily average</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl font-bold">{formatCurrency(stats.dailyAvg, stats.currency)}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-surface-variant/50">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-primary">savings</span>
            </div>
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Savings goal</h4>
            <div className="mt-1">
              <span className="text-xl font-bold">{formatCurrency(stats.savingsGoal, stats.currency)}</span>
              <p className="text-xs text-gray-500 mt-1 truncate">{stats.goalName}</p>
            </div>
          </div>
        </section>

        {/* Money Mood Check-in */}
        <section className="bg-surface-variant/30 rounded-3xl p-6 border border-surface-variant">
          <h3 className="font-bold text-lg mb-4">How did spending feel today?</h3>
          <div className="flex justify-between gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white transition-all active:scale-90"
              >
                <span className={`text-3xl transition-all ${
                  selectedMood === mood ? 'scale-125' : 'grayscale group-hover:grayscale-0'
                }`}>
                  {mood}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg">Recent Transactions</h3>
            <button
              onClick={() => router.push('/analytics')}
              className="text-primary font-bold text-sm"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 && (
              <div className="text-center py-10">
                <p className="text-4xl mb-2">🧾</p>
                <p className="text-on-surface-variant text-sm">No transactions yet.</p>
                <p className="text-on-surface-variant text-sm">Tap + to add your first expense!</p>
              </div>
            )}
            {expenses.slice(0, 5).map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-surface-variant/30"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[expense.category] || 'bg-gray-100 text-gray-600'}`}>
                    <span className="material-symbols-outlined">
                      {categoryIcons[expense.category] || 'receipt'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">{expense.description}</p>
                    <p className="text-xs text-outline">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-red-500">
                  -{formatCurrency(expense.amount, stats.currency)}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FAB */}
      <button
        onClick={() => router.push('/add-expense')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <BottomNav />
    </div>
  );
}



