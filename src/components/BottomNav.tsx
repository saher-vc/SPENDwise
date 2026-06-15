'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/challenges', icon: 'trophy', label: 'Challenges' },
  { href: '/friends', icon: 'group', label: 'Friends' },
  { href: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.06)] rounded-t-2xl">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center rounded-full px-3 py-1 transition-all ${
              isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}