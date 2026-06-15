'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const categories = ['food', 'transport', 'shopping', 'health', 'education', 'entertainment'];

const categoryIcons: Record<string, string> = {
  food: '🍔', transport: '🚗', shopping: '🛍️',
  health: '💊', education: '📚', entertainment: '🎮',
};

const categoryLabels: Record<string, string> = {
  food: 'Food', transport: 'Transport', shopping: 'Shopping',
  health: 'Health', education: 'Education', entertainment: 'Entertainment',
};

export default function AddExpensePage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceText(transcript);
          parseVoiceInput(transcript);
          setListening(false);
        };

        recognition.onerror = () => {
          setVoiceError('Could not hear you. Please try again.');
          setListening(false);
        };

        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const parseVoiceInput = (text: string) => {
    setVoiceError('');
    const lower = text.toLowerCase();

    const amountMatch = lower.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs|dollars?|\$)?/);
    if (amountMatch) {
      setAmount(amountMatch[1].replace(',', ''));
    }

    const categoryMap: Record<string, string> = {
      food: 'food', eat: 'food', lunch: 'food', dinner: 'food',
      breakfast: 'food', chai: 'food', biryani: 'food', pizza: 'food',
      transport: 'transport', uber: 'transport', taxi: 'transport',
      bus: 'transport', petrol: 'transport', fuel: 'transport',
      shop: 'shopping', shopping: 'shopping', clothes: 'shopping',
      health: 'health', doctor: 'health', medicine: 'health', pharmacy: 'health',
      education: 'education', book: 'education', course: 'education',
      entertainment: 'entertainment', movie: 'entertainment', game: 'entertainment',
    };

    for (const [keyword, cat] of Object.entries(categoryMap)) {
      if (lower.includes(keyword)) {
        setCategory(cat);
        break;
      }
    }

    setDescription(text);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    setVoiceError('');
    setVoiceText('');
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const handleScanBill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanResult('');

    try {
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;

      // Priority 1: GRAND TOTAL / NET AMOUNT / AMOUNT DUE
      const grandMatch = text.match(
        /(?:GRAND\s*TOTAL|NET\s*AMOUNT|AMOUNT\s*DUE)[\s:]*\$?([\d,]+\.?\d*)/i
      );

      // Priority 2: Last TOTAL line (not SUBTOTAL)
      const totalMatches = [
        ...text.matchAll(/(?<![A-Z])TOTAL[\s:]*\$?([\d,]+\.?\d*)/gi)
      ];
      const totalMatch = totalMatches.length > 0
        ? totalMatches[totalMatches.length - 1]
        : null;

      // Priority 3: Largest decimal number on receipt
      const allAmounts = [...text.matchAll(/\$?([\d]+\.[\d]{2})/g)]
        .map(m => parseFloat(m[1]))
        .filter(n => n > 0 && n < 999999);
      const largestAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : null;

      let extracted = null;
      if (grandMatch) {
        extracted = grandMatch[1].replace(',', '');
      } else if (totalMatch) {
        extracted = totalMatch[1].replace(',', '');
      } else if (largestAmount) {
        extracted = largestAmount.toString();
      }

      if (extracted) {
        setAmount(extracted);
        setScanResult(`✅ Extracted total: ${extracted}`);
      } else {
        setScanResult('Could not extract amount. Please enter manually.');
      }

      setDescription('Scanned bill');
    } catch {
      setScanResult('Scan failed. Please enter amount manually.');
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description.trim(),
          category,
          date: new Date().toISOString(),
        }),
      });

      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add expense.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] pb-24">

      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/50"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="font-bold text-lg">Add Expense</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-5 pt-6 space-y-5">

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-bold">✅ Expense added! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        )}

        {/* Amount */}
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm text-center">
          <p className="text-on-surface-variant text-sm font-medium mb-2">Amount</p>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full text-center text-5xl font-extrabold text-on-surface bg-transparent outline-none placeholder:text-outline-variant/50"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
          <input
            type="text"
            placeholder="What was this for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-5 py-4 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/60 rounded-2xl"
          />
        </div>

        {/* Category */}
        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 px-1">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all active:scale-95 flex items-center gap-1.5 ${
                  category === cat
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-outline-variant/50 text-on-surface-variant'
                }`}
              >
                <span>{categoryIcons[cat]}</span>
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </section>

        {/* Voice Log */}
        <section className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm">🎤 Voice Log</p>
              <p className="text-xs text-on-surface-variant">
                Say something like "spent 500 on food"
              </p>
            </div>
            <button
              onClick={listening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                listening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'
              }`}
            >
              <span className="material-symbols-outlined">
                {listening ? 'stop' : 'mic'}
              </span>
            </button>
          </div>

          {listening && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... speak now
            </div>
          )}

          {voiceText && !listening && (
            <div className="bg-surface-variant/20 rounded-xl p-3 mt-2">
              <p className="text-xs text-on-surface-variant font-medium mb-1">Heard:</p>
              <p className="text-sm font-medium">&quot;{voiceText}&quot;</p>
              <p className="text-xs text-green-600 mt-1">✅ Form filled automatically</p>
            </div>
          )}

          {voiceError && (
            <p className="text-red-500 text-xs mt-2">{voiceError}</p>
          )}
        </section>

        {/* Bill Scanner */}
        <section className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">📷 Scan Bill</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  PREMIUM
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Take a photo of your receipt to auto-fill
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanLoading}
              className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-60"
            >
              {scanLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined">document_scanner</span>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScanBill}
          />

          {scanLoading && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Scanning your bill...
            </div>
          )}

          {scanResult && (
            <div className="bg-amber-50 rounded-xl p-3 mt-2">
              <p className="text-sm font-medium text-amber-800">{scanResult}</p>
            </div>
          )}
        </section>

        {/* Date */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Date</p>
          <p className="font-semibold text-sm mt-1">
            📅 Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !description}
          className="w-full py-4 bg-primary text-white font-bold rounded-full text-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Adding...' : (
            <>Add Expense <span className="material-symbols-outlined">arrow_forward</span></>
          )}
        </button>

      </main>
      <BottomNav />
    </div>
  );
}