'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/lib/currency';

type TabId = 'overview' | 'trends' | 'categories' | 'insights' | 'mood' | 'leaderboard';

interface DashboardData {
  stats: {
    totalSpent: number;
    dailyAvg: number;
    budget: number;
    savingsGoal: number;
    goalName: string;
    percentUsed: number;
    userName: string;
    persona: string;
    currency: string;  // ADD THIS
  };
  byCategory: Record<string, number>;
  weekly: Record<string, number>;
  expenses: { description: string; category: string; amount: number; date: string }[];
}
const categoryIcons: Record<string, string> = {
  food: 'restaurant',
  transport: 'directions_car',
  shopping: 'shopping_bag',
  health: 'favorite',
  education: 'school',
  entertainment: 'movie',
};

const categoryColors: Record<string, string> = {
  food: '#f97316',
  transport: '#64748b',
  shopping: '#a855f7',
  health: '#ef4444',
  education: '#3b82f6',
  entertainment: '#ec4899',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'categories', label: 'Categories' },
    { id: 'insights', label: 'Insights' },
    { id: 'mood', label: 'Mood' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  const totalSpent = data?.stats.totalSpent ?? 0;
  const dailyAvg = data?.stats.dailyAvg ?? 0;
  const savingsRate = data
    ? Math.max(0, Math.round(((data.stats.budget - totalSpent) / data.stats.budget) * 100))
    : 0;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyAmounts = days.map(d => data?.weekly[d] ?? 0);
  const maxWeekly = Math.max(...weeklyAmounts, 1);

  const categories = Object.entries(data?.byCategory ?? {}).sort((a, b) => b[1] - a[1]);
  const totalCategorySpend = categories.reduce((s, [, v]) => s + v, 0) || 1;

  const userName = data?.stats.userName ?? '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] text-on-surface pb-24 overflow-x-hidden">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-5 py-3 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{loading ? '?' : userInitial}</span>
            </div>
            <h1 className="font-bold text-xl text-primary">SpendWise</h1>
          </div>
          <button
            onClick={() => router.push('/chatbot')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/50"
          >
            <span className="material-symbols-outlined text-on-surface-variant">forum</span>
          </button>
        </div>
      </header>

      <main className="w-full px-4 pt-4 space-y-5">

        {/* Tab Navigation */}
        <nav className="flex overflow-x-auto gap-2 py-1 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-outline-variant text-on-surface-variant'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {loading && (
          <p className="text-center text-on-surface-variant py-10">Loading your data...</p>
        )}

        {/* Overview */}
        {!loading && activeTab === 'overview' && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 p-5 rounded-2xl bg-primary text-white flex flex-col justify-between shadow-lg">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Spend (This Month)</p>
                  <h2 className="text-3xl font-extrabold mt-1 tracking-tight">{formatCurrency(totalSpent, data?.stats.currency)}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full mt-4">
                  <span className="material-symbols-outlined text-sm">
                    {data && data.stats.percentUsed < 50 ? 'trending_down' : 'trending_up'}
                  </span>
                  {data?.stats.percentUsed ?? 0}% of budget used
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm">
                <p className="text-on-surface-variant text-sm font-medium">Daily Avg</p>
                <h3 className="text-2xl font-bold mt-2">{formatCurrency(dailyAvg, data?.stats.currency)}</h3>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm">
                <p className="text-on-surface-variant text-sm font-medium">Savings Rate</p>
                <h3 className="text-2xl font-bold text-green-600 mt-2">{savingsRate}%</h3>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm space-y-3">
              <h4 className="font-bold text-base">Weekly Spending</h4>
              <div className="w-full flex items-end justify-between gap-2" style={{ height: '160px' }}>
  {days.map((d, i) => (
    <div key={d} className="flex-1 flex flex-col items-end justify-end gap-1" style={{ height: '100%' }}>
      <div
        className="w-full bg-primary rounded-t-lg transition-all duration-700 min-h-[4px]"
        style={{ height: `${Math.max((weeklyAmounts[i] / maxWeekly) * 140, weeklyAmounts[i] > 0 ? 4 : 0)}px` }}
      />
      <span className="text-[10px] font-bold text-on-surface-variant uppercase">{d}</span>
    </div>
  ))}
</div>
            </div>
          </section>
        )}

        {/* Trends */}
        {!loading && activeTab === 'trends' && (
          <section className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm space-y-3">
              <h4 className="font-bold text-base">Spending by Day</h4>
              <div className="space-y-2">
                {days.map((d, i) => (
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-10">{d}</span>
                    <div className="flex-1 h-3 bg-surface-variant/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${(weeklyAmounts[i] / maxWeekly) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-24 text-right">{formatCurrency(weeklyAmounts[i], data?.stats.currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm">
              <h4 className="font-bold text-base mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {(data?.expenses ?? []).length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-4">No transactions yet</p>
                )}
                {(data?.expenses ?? []).slice(0, 8).map((e, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-outline-variant/20 last:border-0">
                    <div>
                      <p className="font-medium">{e.description}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{e.category}</p>
                    </div>
                    <span className="font-bold text-red-500">-{formatCurrency(e.amount, data?.stats.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        {!loading && activeTab === 'categories' && (
          <section className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 flex flex-col items-center shadow-sm">
              {categories.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-10">No expenses yet to categorize</p>
              ) : (
                <>
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" fill="none" r="16" stroke="#f1f5f9" strokeWidth="4" />
                      {(() => {
                        let offset = 0;
                        return categories.map(([cat, amt]) => {
                          const pct = (amt / totalCategorySpend) * 100;
                          const dash = `${pct} ${100 - pct}`;
                          const dashOffset = -offset;
                          offset += pct;
                          return (
                            <circle key={cat} cx="18" cy="18" fill="none" r="16"
                              stroke={categoryColors[cat] || '#94a3b8'}
                              strokeDasharray={dash}
                              strokeDashoffset={dashOffset}
                              strokeLinecap="round"
                              strokeWidth="4"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-on-surface-variant">Total</span>
                      <span className="text-base font-black">{formatCurrency(totalCategorySpend, data?.stats.currency)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 text-xs font-bold mt-4">
                    {categories.map(([cat]) => (
                      <div key={cat} className="flex items-center gap-1 capitalize">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[cat] || '#94a3b8' }} />
                        {cat}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {categories.map(([cat, amount]) => (
              <div key={cat} className="p-4 rounded-2xl bg-white border border-outline-variant/50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      {categoryIcons[cat] || 'category'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm capitalize">{cat}</h4>
                    <p className="text-xs text-on-surface-variant">
                      {Math.round((amount / totalCategorySpend) * 100)}% of spending
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm">{formatCurrency(amount, data?.stats.currency)}</p>
              </div>
            ))}
          </section>
        )}

        {/* Insights */}
        {!loading && activeTab === 'insights' && (
          <section className="space-y-4">
            <div className="p-5 rounded-3xl bg-primary-container relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span className="font-bold text-xs tracking-widest uppercase opacity-70">AI Insight</span>
                </div>
                <h3 className="text-lg font-bold leading-snug">
                  {categories.length > 0
                    ? `Your top category is ${categories[0][0]}`
                    : 'Add some expenses to see insights!'}
                </h3>
                <p className="text-sm opacity-80">
                  You&apos;re {data?.stats.percentUsed ?? 0}% through your monthly budget.{' '}
                  {data && data.stats.percentUsed < 70
                    ? "You're on track 🎉"
                    : 'Consider slowing down spending this week.'}
                </p>
                <button
                  onClick={() => setActiveTab('trends')}
                  className="mt-1 bg-primary text-white py-2 px-5 rounded-full font-bold text-sm active:scale-95 transition-transform"
                >
                  View Trend
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-outline-variant/50 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-xs tracking-widest uppercase opacity-70">Goal Forecast</span>
              </div>
              <h3 className="text-lg font-bold leading-snug">
                Saving toward: {data?.stats.goalName ?? 'My Goal'}
              </h3>
              <p className="text-sm text-on-surface-variant">
                Target {formatCurrency(data?.stats.savingsGoal ?? 0, data?.stats.currency)}. Remaining budget this month:{' '}
                {formatCurrency((data?.stats.budget ?? 0) - totalSpent, data?.stats.currency)}.
              </p>
              <button
                onClick={() => router.push('/settings')}
                className="mt-1 bg-primary text-white py-2 px-5 rounded-full font-bold text-sm active:scale-95 transition-transform"
              >
                Adjust Budget
              </button>
            </div>
          </section>
        )}

        {/* Mood */}
        {!loading && activeTab === 'mood' && (
          <section className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-center">Mood vs. Spending</h3>
              <p className="text-on-surface-variant text-sm text-center">
                You feel 😊 best when spending under {formatCurrency(Math.round(dailyAvg), data?.stats.currency)}/day.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-primary-container/30 border border-primary/10 text-center">
                  <span className="text-3xl">😇</span>
                  <p className="text-xs font-bold text-primary mt-1">Zen State</p>
                  <p className="font-bold text-sm">Weekends</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                  <span className="text-3xl">😮‍💨</span>
                  <p className="text-xs font-bold text-red-500 mt-1">Stress Peak</p>
                  <p className="font-bold text-sm">Weekdays</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Leaderboard */}
        {!loading && activeTab === 'leaderboard' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xl">Global Savers</h3>
              <span className="text-xs bg-white border border-outline-variant px-3 py-1 rounded-full font-bold">Top 1%</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥇</span>
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800">PL</div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">PizzaLover</h4>
                  <p className="text-xs text-amber-700">98.2 Savvy Score</p>
                </div>
              </div>
              <span className="font-black text-amber-600">#1</span>
            </div>

            <div className="p-4 rounded-2xl bg-primary-container/20 border-2 border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-black text-primary w-5 text-center">42</span>
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm">
                  {userInitial}
                </div>
                <h4 className="font-bold text-sm">You ({userName})</h4>
              </div>
              <span className="text-sm font-bold text-primary">{savingsRate.toFixed(1)}</span>
            </div>
          </section>
        )}

      </main>

      <BottomNav />
    </div>
  );
}


