'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const quickPrompts = [
  'How much can I spend today?',
  'Give me a savings tip',
  'I overspent this week - help',
  'Where am I spending most?',
];

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! 👋 I'm your SpendWise AI advisor. Ask me anything about your budget, spending, or savings goals!", sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(2);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: nextIdRef.current++, text, sender }]);
  };

  const sendMsg = async (text: string) => {
    const history = messages.map(m => ({ sender: m.sender, text: m.text }));
    addMessage(text, 'user');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      addMessage(data.reply, 'bot');
    } catch {
      addMessage("Oops, something broke on my end 🛠️ Try again?", 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() === '' || isTyping) return;
    sendMsg(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="w-full min-h-screen bg-[#f4fbf8] text-on-surface flex flex-col pb-24">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f4fbf8] border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/50"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <h1 className="font-bold text-base text-primary leading-tight">SpendWise AI</h1>
              <p className="text-[11px] text-on-surface-variant -mt-0.5">Your financial advisor</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-white text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main
        ref={chatContainerRef}
        className="flex-grow px-4 pt-4 pb-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'flex-row-reverse ml-auto' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'bot' ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'
            }`}>
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {msg.sender === 'bot' ? 'smart_toy' : 'person'}
              </span>
            </div>

            <div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'bot'
                ? 'bg-primary-container text-on-primary-container rounded-tl-sm'
                : 'bg-white border border-outline-variant/40 rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-white text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div className="bg-primary-container text-on-primary-container p-3 rounded-2xl rounded-tl-sm text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Quick Prompts */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {quickPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => !isTyping && sendMsg(prompt)}
            disabled={isTyping}
            className="flex-shrink-0 px-4 py-2 bg-white border border-primary text-primary font-medium rounded-full text-xs active:scale-95 transition-transform whitespace-nowrap disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-3">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-outline-variant/40 flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your money..."
            disabled={isTyping}
            className="flex-grow bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant px-3 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || inputValue.trim() === ''}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 disabled:opacity-50"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              send
            </span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}