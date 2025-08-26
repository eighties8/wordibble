import React, { useEffect, useRef } from 'react';
import { LetterState } from '../lib/types';

interface Props {
  guess: string;
  evaluation: LetterState[];
  wordLength: 5 | 6 | 7;
  isWinningRow?: boolean;
  showAnimation?: boolean;
  showFlipAnimation?: boolean;
}

export default function RowHistory({ 
  guess, 
  evaluation, 
  wordLength, 
  isWinningRow = false, 
  showAnimation = false, 
  showFlipAnimation = false
}: Props) {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Configurable timing for tile flip animations
  const TILE_FLIP_DELAY = 800; // ms between each tile starting its flip
  const TILE_FLIP_DURATION = 1200; // ms for each tile's flip animation to complete
  const COLOR_CHANGE_PERCENT = 0.55; // when during the flip to change colors (55%)

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

  // Final colors for the reveal (raw hex so we can feed CSS vars)
  const finalColorsFor = (state: LetterState) => {
    switch (state) {
      case 'correct':
        return { bg: '#22c55e', fg: '#ffffff' }; // green-500
      case 'present':
        return { bg: '#f59e0b', fg: '#ffffff' }; // amber-500
      case 'absent':
        return { bg: '#d1d5db', fg: '#6b7280' }; // gray-300 / gray-500-ish text
      default:
        return { bg: '#e5e7eb', fg: '#111827' }; // gray-200 / gray-900
    }
  };

  // Set CSS custom properties with delay to match the 55% keyframe
  useEffect(() => {
    tileRefs.current.forEach((tileRef, i) => {
      if (tileRef && tileRef.classList.contains('animate-flip-simple')) {
        const { bg, fg } = finalColorsFor(evaluation[i] || 'absent');
        const flipDelay = (isWinningRow && showAnimation) ? (i * TILE_FLIP_DELAY) : (showFlipAnimation ? i * TILE_FLIP_DELAY : 0);
        // const colorChangeDelay = flipDelay + 440; // 55% of 1200ms = 660ms
        const colorChangeDelay = flipDelay + (TILE_FLIP_DURATION * COLOR_CHANGE_PERCENT);
        
        setTimeout(() => {
          if (tileRef) {
            tileRef.style.setProperty('--final-bg', bg);
            tileRef.style.setProperty('--final-fg', fg);
          }
        }, colorChangeDelay);
      }
    });
  }, [isWinningRow, showAnimation, showFlipAnimation, evaluation]);

  return (
    <div className="flex justify-center">
      <div className={`grid gap-2 md:gap-1 perspective-1000 ${getGridCols(wordLength)}`}>
        {Array.from({ length: wordLength }).map((_, i) => {
          const state = evaluation[i] || 'absent';
          const isAbsent = state === 'absent';
          const isCorrect = state === 'correct';

          // For flip animations, each tile should wait for the previous one to complete
          // The flip animation takes 1200ms, so each tile waits 1200ms after the previous
          // Both winning row and regular flip animations should use sequential timing
          const flipDelay = (isWinningRow && showAnimation) ? (i * TILE_FLIP_DELAY) : (showFlipAnimation ? i * TILE_FLIP_DELAY : 0);
          const isRevealing = (isWinningRow && isCorrect && showAnimation) || showFlipAnimation;

          return (
            <div key={i} className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div
                ref={el => {tileRefs.current[i] = el}}
                className={[
                  'tile-panel flex items-center justify-center text-center font-semibold uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d',
                  isRevealing ? 'animate-flip-simple' : getTileColor(state)
                ].join(' ')}
                style={isRevealing ? ({
                  animationDelay: `${flipDelay}ms`,
                } as React.CSSProperties) : undefined}
              >
                <span className={`backface-hidden ${isAbsent ? 'line-through-custom' : ''}`}>
                  {guess[i] || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
