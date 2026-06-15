'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const tapTargetRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  const proceed = () => {
    if (isExiting) return;
    setIsExiting(true);

    if (mainContainerRef.current && tapTargetRef.current) {
      mainContainerRef.current.style.transition =
        'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';
      mainContainerRef.current.style.transform = 'scale(0.95)';
      mainContainerRef.current.style.opacity = '0';

      tapTargetRef.current.style.opacity = '0';
      tapTargetRef.current.style.transform = 'translateY(20px)';
    }

    // Navigate after animation
   setTimeout(() => {
  router.push('/intro');
}, 400);
  };

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainContainerRef.current || isExiting) return;

      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;

      mainContainerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isExiting]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        proceed();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isExiting]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative font-body-md text-on-background overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 glass-background pointer-events-none" />

      {/* Main Content */}
      <main
        ref={mainContainerRef}
        className="z-10 flex flex-col items-center text-center px-container-margin w-full max-w-md transition-transform"
      >
        {/* Logo */}
        <div className="mb-xs">
          <h1 className="font-display-lg text-display-lg text-primary flex items-center gap-2">
            SpendWise <span>💰</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="font-body-lg text-on-surface-variant">
          Your smart money sidekick <span>✨</span>
        </p>
      </main>

      {/* Tap Area */}
      <div
        ref={tapTargetRef}
        onClick={proceed}
        className="fixed bottom-10 w-full flex flex-col items-center cursor-pointer select-none transition-all duration-300"
      >
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse mb-2">
          <span className="material-symbols-outlined text-primary">
            keyboard_arrow_down
          </span>
        </div>

        <button className="text-xs uppercase tracking-widest text-outline hover:text-primary transition">
          Tap to continue
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-[10%] opacity-20 hidden md:block">
        <div className="w-32 h-32 rounded-3xl bg-primary-container blur-3xl" />
      </div>

      <div className="absolute bottom-40 right-[15%] opacity-20 hidden md:block">
        <div className="w-48 h-48 rounded-full bg-tertiary-container blur-3xl" />
      </div>
    </div>
  );
}