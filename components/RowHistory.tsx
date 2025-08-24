import React from 'react';
import { LetterState } from '../lib/types';

interface Props {
  guess: string;
  evaluation: LetterState[];
  wordLength: 5 | 6;
}

export default function RowHistory({ guess, evaluation, wordLength }: Props) {
  const getTileColor = (state: LetterState) => {
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'present':
        return 'bg-amber-500 text-white';
      case 'absent':
        return 'bg-gray-300 text-gray-700';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  return (
    <div className="flex justify-center">
      <div className={`grid gap-1 ${wordLength === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const state = evaluation[i] || 'absent';
          const isAbsent = state === 'absent';
          
          return (
            <div
              key={i}
              className={[
                'w-14 h-14 rounded-lg text-center text-xl font-semibold uppercase flex items-center justify-center',
                getTileColor(state)
              ].join(' ')}
            >
              <span className={isAbsent ? 'line-through' : ''}>
                {guess[i] || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
