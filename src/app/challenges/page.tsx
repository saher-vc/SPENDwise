'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  target: number;
}

interface UserChallenge {
  id: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  challenge: Challenge;
}

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [points, setPoints] = useState(0);
  const [userInitial, setUserInitial] = useState('?');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
  try {
    const [dashRes, chalRes] = await Promise.all([
      fetch('/api/dashboard'),
      fetch('/api/challenges'),
    ]);

    if (dashRes.status === 401) { router.push('/login'); return; }

    const dashText = await dashRes.text();
    const chalText = await chalRes.text();

    const dashData = dashText ? JSON.parse(dashText) : {};
    const chalData = chalText ? JSON.parse(chalText) : {};

    setUserInitial(dashData.stats?.userName?.charAt(0).toUpperCase() ?? '?');
    setChallenges(chalData.challenges ?? []);
    setUserChallenges(chalData.userChallenges ?? []);
    setBadges(chalData.badges ?? []);
    setAllBadges(chalData.allBadges ?? []);
    setPoints(chalData.points ?? 0);
  } catch (err) {
    console.error('fetchData error:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(); }, []);

  const getUserChallenge = (challengeId: string) =>
    userChallenges.find(uc => uc.challengeId === challengeId);

  const handleJoin = async (challengeId: string) => {
    setActionLoading(challengeId);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', challengeId }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProgress = async (userChallengeId: string) => {
    setActionLoading(userChallengeId);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'progress', userChallengeId }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const earnedBadgeIds = new Set(badges.map(b => b.id));

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] text-on-surface pb-24">

      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">{userInitial}</span>
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

      <main className="px-5 pt-5 space-y-5">

        {/* Points + Badges */}
        <section className="flex gap-3">
          <div className="flex-1 bg-primary-container text-on-primary-container px-5 py-4 rounded-2xl shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Your points</p>
            <p className="text-2xl font-extrabold">{points} 🔥</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 bg-white border border-outline-variant px-5 py-4 rounded-2xl font-bold text-primary shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
            <span className="text-sm">Badges ({badges.length})</span>
          </button>
        </section>

        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">rocket_launch</span>
          Available Challenges
        </h2>

        {loading && <p className="text-center text-on-surface-variant py-10">Loading...</p>}

        {!loading && challenges.map(challenge => {
          const uc = getUserChallenge(challenge.id);
          const progressPct = uc ? (uc.progress / challenge.target) * 100 : 0;

          return (
            <div key={challenge.id} className="bg-white p-5 rounded-3xl shadow-sm border border-outline-variant/30">
              <div className="flex items-start justify-between mb-2">
                <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {challenge.type === 'streak' ? '🌿' : challenge.type === 'weekly' ? '📝' : '⚡'}
                </div>
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    +{challenge.points} pts
                  </span>
                  {uc?.completed && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      ✅ Done
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold mt-3 mb-1">{challenge.title}</h3>
              <p className="text-on-surface-variant text-sm mb-4">{challenge.description}</p>

              {uc && !uc.completed && challenge.target > 1 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Progress: {uc.progress}/{challenge.target}</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {!uc ? (
                <button
                  onClick={() => handleJoin(challenge.id)}
                  disabled={actionLoading === challenge.id}
                  className="w-full font-bold py-3 rounded-xl bg-primary text-white active:scale-95 transition-all disabled:opacity-60"
                >
                  {actionLoading === challenge.id ? 'Joining...' : 'Join Challenge'}
                </button>
              ) : uc.completed ? (
                <div className="w-full font-bold py-3 rounded-xl bg-green-500 text-white text-center">
                  Completed 🎉 +{challenge.points} pts earned
                </div>
              ) : (
                <button
                  onClick={() => handleProgress(uc.id)}
                  disabled={actionLoading === uc.id}
                  className="w-full font-bold py-3 rounded-xl bg-primary-container text-on-primary-container active:scale-95 transition-all disabled:opacity-60"
                >
                  {actionLoading === uc.id ? 'Updating...' : challenge.target > 1 ? `Mark Progress (${uc.progress}/${challenge.target})` : 'Mark as Done'}
                </button>
              )}
            </div>
          );
        })}
      </main>

      {/* Badges Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden relative shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Your Badges</h2>
                <button
                  className="w-9 h-9 flex items-center justify-center bg-surface-variant rounded-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {allBadges.map(badge => {
                  const earned = earnedBadgeIds.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex flex-col items-center p-3 rounded-2xl ${
                        earned ? 'bg-primary-container' : 'border-2 border-dashed border-outline-variant grayscale opacity-50'
                      }`}
                    >
                      <span className="text-3xl mb-1">{badge.emoji}</span>
                      <span className="font-bold text-[11px] text-center">{badge.name}</span>
                      <span className="text-[9px] text-on-surface-variant mt-0.5 text-center">
                        {earned ? 'Earned ✅' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}