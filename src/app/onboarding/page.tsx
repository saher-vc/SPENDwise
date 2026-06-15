'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [persona, setPersona] = useState('');
  const [budget, setBudget] = useState(1500);
  const [categories, setCategories] = useState<string[]>([]);
  const [savingsGoal, setSavingsGoal] = useState(300);
  const [savingsTarget, setSavingsTarget] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalCardScale, setModalCardScale] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const progressPercent = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    setError('');

    if (currentStep === 1 && !persona) {
      setError('Please select who you are to continue.');
      return;
    }

    if (currentStep === 2 && (!budget || budget <= 0)) {
      setError('Please enter a valid monthly budget.');
      return;
    }

    if (currentStep === 3 && categories.length === 0) {
      setError('Please select at least one spending category.');
      return;
    }

    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleFinish = async () => {
    if (savingsGoal <= 0) {
      setError('Please set a savings goal greater than 0.');
      return;
    }

    if (!savingsTarget.trim()) {
      setError('Please tell us what you are saving for.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          budget,
          savingsGoal,
          goalName: savingsTarget.trim(),
          onboarded: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save your preferences.');
      }

      setShowModal(true);
      setTimeout(() => setModalCardScale(true), 10);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8] overflow-x-hidden px-5 pt-6 pb-32 flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <div className="flex justify-between items-center px-5 py-3 w-full">
          <span className="text-xl font-bold text-primary">
            SpendWise
          </span>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-primary">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl1R-yhpET1mghIo-cFtEMqfvZVhcA1knxLoy3XOlv50svQ6yCYWkL7pgweZLclpNbc5HcpD6WDXay_1wDikElJbqRioZEGp8H9-3DJLSOHfiNocgO03HkO2tBoAgtZij2iGDH4zNgzxbzhYbnO2yFwBTtVvaK-xefkguNOxVUMSUK8gMK2CpdLh91orMwbH-PO_QXsbNcrckXFuO8lunLw46Xt2iLGQXlJgVGAhRU9PL1XiXfzvcDUQYiaoJX2G2viYlVajilDkvS"
              />
            </div>

            <button
              onClick={() => router.push('/chatbot')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
            >
              <span className="material-symbols-outlined text-gray-600">forum</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow pt-20 flex flex-col items-center max-w-xl mx-auto w-full">

        {/* Progress */}
        <div className="w-full mb-8 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* STEP 1 — Who are you */}
        {currentStep === 1 && (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Let&apos;s get to know you 🧃</h1>
            <p className="text-gray-500 mb-6">Select the option that best describes you.</p>

            {[
              { value: 'student', label: 'Student 🎓', desc: 'Managing tuition, food, and daily expenses' },
              { value: 'professional', label: 'Professional 💼', desc: 'Salary-based spending and savings' },
              { value: 'freelancer', label: 'Freelancer 💻', desc: 'Variable income, flexible budgeting' },
            ].map(({ value, label, desc }) => (
              <label key={value} className="block mb-3 cursor-pointer">
                <input
                  type="radio"
                  name="persona"
                  value={value}
                  checked={persona === value}
                  className="hidden"
                  onChange={(e) => setPersona(e.target.value)}
                />
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    persona === value
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* STEP 2 — Monthly budget */}
        {currentStep === 2 && (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Your monthly budget 💰</h1>
            <p className="text-gray-500 mb-6">How much do you spend in a month?</p>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full p-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                min={0}
                placeholder="e.g. 25000"
              />
            </div>
          </div>
        )}

        {/* STEP 3 — Categories */}
        {currentStep === 3 && (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Spending categories 🗂️</h1>
            <p className="text-gray-500 mb-6">Select all that apply to you.</p>

            {[
              { value: 'food', label: 'Food & Dining 🍔' },
              { value: 'transport', label: 'Transport 🚌' },
              { value: 'shopping', label: 'Shopping 🛍️' },
              { value: 'health', label: 'Health 💊' },
              { value: 'education', label: 'Education 📚' },
              { value: 'entertainment', label: 'Entertainment 🎮' },
            ].map(({ value, label }) => (
              <label key={value} className="block mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categories.includes(value)}
                  className="hidden"
                  onChange={() => toggleCategory(value)}
                />
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    categories.includes(value)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-medium">{label}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* STEP 4 — Savings goal */}
        {currentStep === 4 && (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Savings goal 🎯</h1>
            <p className="text-gray-500 mb-6">How much do you want to save each month?</p>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Monthly savings target</span>
              <span className="font-bold text-primary">Rs {savingsGoal}</span>
            </div>

            <input
              type="range"
              min={0}
              max={100000}
              step={500}
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(Number(e.target.value))}
              className="w-full accent-primary"
            />

            <div className="flex justify-between text-xs text-gray-400 mb-6">
              <span>Rs 0</span>
              <span>Rs 100,000</span>
            </div>

            <input
              type="text"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              placeholder="What are you saving for? (e.g. New laptop)"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="w-full mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        {/* Navigation Buttons */}
        <div className="w-full mt-8 flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl font-medium"
            >
              Back
            </button>
          )}

          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              className="flex-1 p-3 bg-primary text-white rounded-xl font-medium"
            >
              Next
            </button>
          )}

          {currentStep === totalSteps && (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 p-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Finish'}
            </button>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div
            className={`bg-white p-8 rounded-2xl shadow-xl text-center transition-transform duration-200 ${
              modalCardScale ? 'scale-100' : 'scale-95'
            }`}
          >
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
            <p className="text-gray-500 mb-6">Your SpendWise profile is ready.</p>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full p-3 bg-primary text-white rounded-xl font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}