import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye } from 'lucide-react';

interface SplashScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
}

// Set your first puzzle date here (UTC): Aug 25, 2025
const START_UTC = Date.UTC(2025, 7, 25); // months are 0-based (7 = August)

function getTodayPuzzleNumber(): number {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.floor((todayUTC - START_UTC) / 86_400_000);
  return days + 1; // #1 on start day
}

export default function SplashScreen({ onStartGame, onOpenSettings }: SplashScreenProps) {
  const router = useRouter();
  const puzzleNumber = useMemo(getTodayPuzzleNumber, []);

  return (
    // removed min-h-screen to avoid stacking overflow with layout header/footer
    <div className="flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-6">
          {/* <div className="grid grid-cols-2 gap-1.5 p-2 w-20 h-20 border-4 border-gray-500 rounded-lg mx-auto mb-4">
            <div className="bg-green-500 rounded-sm" />
            <div className="bg-amber-500 rounded-sm" />
            <div className="bg-green-500 rounded-sm" />
            <div className="bg-green-500 rounded-sm" />
          </div> */}
          <div className="p-0 w-20 h-20 border-8 border-gray-500 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Eye className="w-20 h-20 text-gray-200" />
          </div>
        </div>

        <h1 className="text-5xl mb-4">Wordseer</h1>

        <h2 className="text-lg mb-8">
          Get 6 chances to guess a 5-7 letter word.
        </h2>

        {/* Action */}
        <div className="space-y-2">
          {/* inline, green button */}
          <button
            onClick={onStartGame}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-green-500 transition-colors"
          >
            Play
          </button>

          {/* Puzzle number */}
          <div className="text-sm title">Wordseer #{puzzleNumber}</div>
        </div>

        {/* Links */}
        <div className="mt-10 space-y-2">
          <div className="flex justify-center space-x-4">
            <button onClick={() => router.push('/how-to-play')} className="hover:text-gray-700 transition-colors title">
              How to Play
            </button>
            <button onClick={() => router.push('/stats')} className="hover:text-gray-700 transition-colors title">
              Statistics
            </button>
            <button onClick={() => router.push('/archive')} className="hover:text-gray-700 transition-colors title">
              Archive
            </button>
          </div>
        </div>

        {/* <div className="mt-12 text-xs text-gray-400">
          <div className="mb-1">Wordseer – A word guessing game with clues</div>
          <div>Challenge your vocabulary and deduction skills</div>
        </div> */}
      </div>
    </div>
  );
}