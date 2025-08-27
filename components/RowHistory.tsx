import React, { useEffect, useRef } from 'react';
import { LetterState } from '../lib/types';
import { ANIMATION_CONFIG } from '../lib/config';

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

    
    // Set the flip backface color for all tiles
    document.documentElement.style.setProperty('--flip-backface-color', ANIMATION_CONFIG.FLIP_BACKFACE_COLOR);
    
    tileRefs.current.forEach((tileRef, i) => {
      if (tileRef && tileRef.classList.contains('animate-flip-simple')) {
        const { bg, fg } = finalColorsFor(evaluation[i] || 'absent');
        const flipDelay = (isWinningRow && showAnimation) ? (i * ANIMATION_CONFIG.TILE_FLIP_DELAY) : (showFlipAnimation ? i * ANIMATION_CONFIG.TILE_FLIP_DELAY : 0);
        const colorChangeDelay = flipDelay + (ANIMATION_CONFIG.TILE_FLIP_DURATION * ANIMATION_CONFIG.COLOR_CHANGE_PERCENT);
        
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
          // DEFENSIVE FIX: If this is a winning row, force all tiles to be 'correct'
          const state = isWinningRow ? 'correct' : (evaluation[i] || 'absent');
          const isAbsent = state === 'absent';
          const isCorrect = state === 'correct';

          // For flip animations, each tile should wait for the previous one to complete
          // Both winning row and regular flip animations should use sequential timing
          const flipDelay = (isWinningRow && showAnimation) ? (i * ANIMATION_CONFIG.TILE_FLIP_DELAY) : (showFlipAnimation ? i * ANIMATION_CONFIG.TILE_FLIP_DELAY : 0);
          const isRevealing = (isWinningRow && showAnimation) || showFlipAnimation;

          return (
            <div key={i} className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div
                ref={el => {tileRefs.current[i] = el}}
                className={[
                  'tile-panel flex items-center justify-center text-center font-semibold uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d',
                  isRevealing ? 'animate-flip-simple' : getTileColor(state)
                ].join(' ')}
                style={isRevealing ? {
                  animationDelay: `${flipDelay}ms`,
                  ...(isWinningRow && !isRevealing ? {
                    backgroundColor: '#22c55e', // Force green for winning rows
                    color: '#ffffff'
                  } : {})
                } : (isWinningRow ? {
                  backgroundColor: '#22c55e', // Force green for winning rows
                  color: '#ffffff'
                } : undefined)}
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
