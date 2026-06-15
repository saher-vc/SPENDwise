'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';

interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  email: string;
}

interface FriendRequest {
  id: string;
  sender: { id: string; name: string; email: string };
}

interface Split {
  id: string;
  title: string;
  totalAmount: number;
  createdBy: { id: string; name: string };
  participants: {
    id: string;
    userId: string;
    amount: number;
    paid: boolean;
    user: { id: string; name: string };
  }[];
  createdAt: string;
}

const paymentMethods = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    color: 'bg-red-500',
    icon: '📱',
    getLink: (amount: number) => `jazzcash://pay?amount=${amount}`,
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    color: 'bg-green-500',
    icon: '💚',
    getLink: (amount: number) => `easypaisa://payment?amount=${amount}`,
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    color: 'bg-blue-500',
    icon: '🏦',
    getLink: () => null,
  },
];

export default function FriendsPage() {
  const router = useRouter();
  const [userInitial, setUserInitial] = useState('?');
  const [userId, setUserId] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string; email: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitTitle, setSplitTitle] = useState('');
  const [splitTotal, setSplitTotal] = useState('');
  const [splitParticipants, setSplitParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSplit, setPaymentSplit] = useState<Split | null>(null);
  const [paymentParticipantId, setPaymentParticipantId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDone, setPaymentDone] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, friendsRes, splitsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/friends'),
        fetch('/api/splits'),
      ]);

      if (dashRes.status === 401) { router.push('/login'); return; }

      const dashData = await dashRes.json();
      const friendsData = await friendsRes.json();
      const splitsData = await splitsRes.json();

      setUserInitial(dashData.stats.userName?.charAt(0).toUpperCase() ?? '?');
      setUserId(dashData.user.id);
      setCurrency(dashData.stats.currency ?? 'PKR');
      setFriends(friendsData.friends ?? []);
      setIncoming(friendsData.incoming ?? []);
      setSplits(splitsData.splits ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', email: searchEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error); return; }
      setSearchResult(data.user);
    } catch {
      setSearchError('Something went wrong');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    setActionLoading(targetUserId);
    setSearchError('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'Failed to send request');
        return;
      }
      setSearchResult(null);
      setSearchEmail('');
      await fetchData();
    } catch {
      setSearchError('Network error. Try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', friendshipId }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', friendshipId }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSettle = async (splitParticipantId: string) => {
    setActionLoading(splitParticipantId);
    try {
      await fetch('/api/splits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitParticipantId }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const openPaymentModal = (split: Split, participantId: string, amount: number) => {
    setPaymentSplit(split);
    setPaymentParticipantId(participantId);
    setPaymentAmount(amount);
    setPaymentDone(false);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodClick = async (method: typeof paymentMethods[0]) => {
    const link = method.getLink(paymentAmount);
    if (link) window.open(link, '_blank');
    await handleSettle(paymentParticipantId);
    setPaymentDone(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      fetchData();
    }, 2000);
  };

  const handleCreateSplit = async () => {
    if (!splitTitle || !splitTotal || splitParticipants.length === 0) return;
    const total = parseFloat(splitTotal);
    const perPerson = total / (splitParticipants.length + 1);
    const participants = splitParticipants.map(uid => ({ userId: uid, amount: perPerson }));
    try {
      await fetch('/api/splits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: splitTitle, totalAmount: total, participants }),
      });
      setShowSplitModal(false);
      setSplitTitle('');
      setSplitTotal('');
      setSplitParticipants([]);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleParticipant = (uid: string) => {
    setSplitParticipants(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] text-on-surface pb-24">

      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-5 py-3 w-full">
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

        {/* Search friend */}
        <section className="bg-white rounded-2xl p-4 border border-outline-variant/30 shadow-sm space-y-3">
          <h2 className="font-bold text-base">Add a Friend</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter friend's email"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-3 border border-outline-variant/50 rounded-xl text-sm outline-none focus:border-primary"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-60"
            >
              {searchLoading ? '...' : 'Search'}
            </button>
          </div>
          {searchError && (
            <p className="text-red-500 text-sm font-medium">{searchError}</p>
          )}
          {searchResult && (
            <div className="flex items-center justify-between p-3 bg-surface-variant/20 rounded-xl">
              <div>
                <p className="font-bold text-sm">{searchResult.name}</p>
                <p className="text-xs text-on-surface-variant">{searchResult.email}</p>
              </div>
              <button
                onClick={() => handleSendRequest(searchResult.id)}
                disabled={actionLoading === searchResult.id}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold disabled:opacity-60"
              >
                {actionLoading === searchResult.id ? '...' : 'Add'}
              </button>
            </div>
          )}
        </section>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold text-base">
              Friend Requests ({incoming.length})
            </h2>
            {incoming.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm">{req.sender.name}</p>
                  <p className="text-xs text-on-surface-variant">{req.sender.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Friends list */}
        <section>
          <h2 className="font-bold text-base mb-3">Friends ({friends.length})</h2>
          {loading && (
            <p className="text-sm text-on-surface-variant">Loading...</p>
          )}
          {!loading && friends.length === 0 && (
            <div className="text-center py-8 bg-white rounded-2xl border border-outline-variant/30">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-on-surface-variant text-sm">No friends yet.</p>
              <p className="text-on-surface-variant text-sm">Search by email to add friends!</p>
            </div>
          )}
          {friends.length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
              {friends.map((friend, i) => (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < friends.length - 1 ? 'border-b border-outline-variant/20' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{friend.name}</p>
                    <p className="text-xs text-on-surface-variant">{friend.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bill Splits */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-base">Bill Splits</h2>
            {friends.length > 0 && (
              <button
                onClick={() => setShowSplitModal(true)}
                className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Split
              </button>
            )}
          </div>

          {splits.length === 0 && !loading && (
            <div className="text-center py-8 bg-white rounded-2xl border border-outline-variant/30">
              <p className="text-4xl mb-2">🧾</p>
              <p className="text-on-surface-variant text-sm">No splits yet.</p>
              <p className="text-on-surface-variant text-sm">Add friends and split a bill!</p>
            </div>
          )}

          <div className="space-y-3">
            {splits.map(split => {
              const myPart = split.participants.find(p => p.userId === userId);
              const iCreated = split.createdBy.id === userId;
              return (
                <div
                  key={split.id}
                  className="bg-white rounded-2xl p-4 border border-outline-variant/30 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{split.title}</p>
                      <p className="text-xs text-on-surface-variant">
                        Total: {formatCurrency(split.totalAmount, currency)} · {split.participants.length} people
                      </p>
                    </div>
                    {iCreated && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        You paid
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-3">
                    {split.participants.map(p => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span className={p.userId === userId ? 'font-bold' : 'text-on-surface-variant'}>
                          {p.userId === userId ? 'You' : p.user.name}
                        </span>
                        <span className={`font-medium ${p.paid ? 'text-green-600' : 'text-red-500'}`}>
                          {formatCurrency(p.amount, currency)} {p.paid ? '✅' : '⏳'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {myPart && !myPart.paid && !iCreated && (
                    <button
                      onClick={() => openPaymentModal(split, myPart.id, myPart.amount)}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
                    >
                      💸 Pay {formatCurrency(myPart.amount, currency)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* New Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSplitModal(false)}
          />
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Split a Bill</h2>

            <input
              type="text"
              placeholder="What's this for? (e.g. Pizza night)"
              value={splitTitle}
              onChange={e => setSplitTitle(e.target.value)}
              className="w-full p-3 border border-outline-variant/50 rounded-xl text-sm outline-none focus:border-primary mb-3"
            />

            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {currency}
              </span>
              <input
                type="number"
                placeholder="Total amount"
                value={splitTotal}
                onChange={e => setSplitTotal(e.target.value)}
                className="w-full p-3 pl-14 border border-outline-variant/50 rounded-xl text-sm outline-none focus:border-primary"
              />
            </div>

            <p className="text-xs font-bold uppercase text-on-surface-variant mb-2">
              Split with
            </p>
            {friends.map(friend => (
              <label
                key={friend.id}
                className="flex items-center gap-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={splitParticipants.includes(friend.id)}
                  onChange={() => toggleParticipant(friend.id)}
                  className="w-4 h-4 accent-primary"
                />
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {friend.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">{friend.name}</span>
              </label>
            ))}

            {splitTotal && splitParticipants.length > 0 && (
              <p className="text-sm text-primary font-bold mt-2">
                Each person pays:{' '}
                {formatCurrency(
                  parseFloat(splitTotal) / (splitParticipants.length + 1),
                  currency
                )}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 py-3 border border-outline-variant rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSplit}
                disabled={!splitTitle || !splitTotal || splitParticipants.length === 0}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-60"
              >
                Create Split
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentSplit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !paymentDone && setShowPaymentModal(false)}
          />
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            {paymentDone ? (
              <div className="text-center py-4">
                <p className="text-5xl mb-3">✅</p>
                <h2 className="text-xl font-bold text-green-600">Payment Sent!</h2>
                <p className="text-on-surface-variant text-sm mt-2">
                  Marked as paid successfully.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1">Pay Your Share</h2>
                <p className="text-on-surface-variant text-sm mb-1">
                  {paymentSplit.title}
                </p>
                <p className="text-3xl font-extrabold text-primary mb-5">
                  {formatCurrency(paymentAmount, currency)}
                </p>

                <p className="text-xs font-bold uppercase text-on-surface-variant mb-3">
                  Choose payment method
                </p>

                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodClick(method)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-white font-bold active:scale-95 transition-transform ${method.color}`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-bold">{method.name}</p>
                        <p className="text-xs opacity-80">
                          {method.id === 'bank'
                            ? 'Manual bank transfer'
                            : `Open ${method.name} app`}
                        </p>
                      </div>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full mt-4 py-3 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}