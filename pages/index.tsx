'use client';
import { useEffect, useState } from 'react';
import Game from '@/components/Game';
import SplashScreen from '@/components/SplashScreen';
import { useRouter } from 'next/router';

type View = 'loading' | 'game' | 'splash';

export default function Home() {
  const [view, setView] = useState<View>('loading');
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    // If navigating from Archive (e.g., /?date=YYYY-MM-DD&archive=true), skip splash
    const isArchiveRoute = router.query.archive === 'true' && typeof router.query.date === 'string';
    if (isArchiveRoute) {
      setView('game');
      return;
    }

    // Otherwise decide what to show based on localStorage
    try {
      const raw = localStorage.getItem('wordibble:puzzles:v2');
      const store = raw ? JSON.parse(raw) : {};
      const todayId = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const today = store[todayId];

      if (today && (today.gameStatus === 'playing' || today.gameStatus === 'not_started' || today.attempts?.length > 0)) {
        setView('game');
      } else {
        setView('splash');
      }
    } catch {
      setView('splash');
    }
  }, [router.isReady, router.query.archive, router.query.date]);

  if (view === 'loading') {
    // This prevents flashing the game before decision is made
    return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>;
  }

  return view === 'game' ? (
    <Game />
  ) : (
    <SplashScreen
      onStartGame={() => {
        const todayId = new Date().toISOString().slice(0, 10);
        const raw = localStorage.getItem('wordibble:puzzles:v2');
        const store = raw ? JSON.parse(raw) : {};
        if (!store[todayId]) {
          store[todayId] = { attempts: [], gameStatus: 'not_started', won: false };
          localStorage.setItem('wordibble:puzzles:v2', JSON.stringify(store));
        }
        setView('game'); // single click → straight into Game
      }}
      onOpenSettings={() => {}}
    />
  );

}