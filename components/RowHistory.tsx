import React from 'react';
import { LetterState } from '../lib/types';

interface Props {
  guess: string;
  evaluation: LetterState[];
  wordLength: 5 | 6 | 7;
  isWinningRow?: boolean;
  showAnimation?: boolean;
  animationDelay?: number;
}

export default function RowHistory({ guess, evaluation, wordLength, isWinningRow = false, showAnimation = false, animationDelay = 0 }: Props) {
  const getTileColor = (state: LetterState) => {
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'present':
        return 'bg-amber-500 text-white';
      case 'absent':
        return 'bg-gray-300 text-gray-400';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  const getGridCols = (length: number) => {
    switch (length) {
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      default: return 'grid-cols-5';
    }
  };

  return (
    <div className="flex justify-center">
      <div className={`grid gap-2 md:gap-1 ${getGridCols(wordLength)}`}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const state = evaluation[i] || 'absent';
          const isAbsent = state === 'absent';
          const isCorrect = state === 'correct';
          
          return (
            <div
              key={i}
              className={[
                'w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg text-center font-semibold uppercase flex items-center justify-center text-lg md:text-lg lg:text-xl',
                getTileColor(state),
                isWinningRow && isCorrect && showAnimation ? 'animate-flip' : '',
                isWinningRow && isCorrect ? `animation-delay-${animationDelay + i * 100}` : ''
              ].join(' ')}
            >
              <span className={isAbsent ? 'line-through-custom' : ''}>
                {guess[i] || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
