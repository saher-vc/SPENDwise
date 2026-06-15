import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpendWise',
  description: 'Your smart money sidekick',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>

      <body className="min-h-screen bg-background text-on-background">
        <div id="app-shell" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}