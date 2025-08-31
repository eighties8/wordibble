// components/GuessInputRow.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AArrowDown, Bot } from 'lucide-react';

export type GuessInputRowHandle = {
  /** Focus first editable cell (even if it already has a value) */
  focusFirstEditable: () => void;
  /** Focus first editable **empty** cell; falls back to first editable */
  focusFirstEmptyEditable: () => void;
  /** Force clear all non-locked cells */
  clearInputs: () => void;
};

type Props = {
  wordLength: number;
  locked: boolean[];          // true => readOnly/locked (e.g., revealed vowels / green matches)
  initialCells: string[];     // prefilled values for each index ('' if none)
  onChange: (letters: string[]) => void;
  isShaking?: boolean;        // trigger shake animation
  forceClear?: boolean;       // force clear all non-locked cells
  fadeOutClear?: boolean;     // trigger fade-out before clearing (for successful submissions)
  onFadeOutComplete?: () => void; // callback when fade-out animation completes
  revealedLetters?: Set<number>; // positions of letters revealed by lifeline
  wasRevealedPositions?: Set<number>; // positions that were previously revealed (for focus handling)
  readOnly?: boolean;         // make entire row read-only (e.g., completed puzzle)
  showFadeIn?: boolean;      // trigger fade-in animation for locked cells
  gameStatus?: string;        // game status to check if we're in won state
};

const GuessInputRow = forwardRef<GuessInputRowHandle, Props>(
  ({ wordLength, locked, initialCells, onChange, isShaking, forceClear, fadeOutClear, onFadeOutComplete, revealedLetters, wasRevealedPositions, readOnly, showFadeIn, gameStatus }, ref) => {

    
    // keep a local controlled buffer to emit via onChange
    const [cells, setCells] = useState<string[]>(
      () => {
        // For won/lost games, ensure we show the complete solution
        if (gameStatus === 'won' || gameStatus === 'lost') {
          return initialCells.slice(0, wordLength);
        }
        return initialCells.slice(0, wordLength);
      }
    );

    // refs for each input
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const tilePanelRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    // ref to track when cells are being updated from parent
    const isUpdatingFromParent = useRef(false);

    // keep cells in sync if parent sends new initialCells (e.g., new greens)
    useEffect(() => {
      isUpdatingFromParent.current = true;
      const newCells = initialCells.slice(0, wordLength);
      setCells(newCells);
      
      // Clear flag after state update
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
    }, [initialCells, wordLength]);

    // Force reset cells when revealedLetters changes (to handle post-submit unlock)
    useEffect(() => {
      if (revealedLetters && revealedLetters.size === 0) {
        isUpdatingFromParent.current = true;
        
        // Only reset cells that were previously revealed, preserve user input
        setCells(prev => {
          const next = prev.slice();
          for (let i = 0; i < wordLength; i++) {
            // If this position was previously revealed, clear it
            if (wasRevealedPositions && wasRevealedPositions.has(i)) {
              next[i] = '';
            }
            // Otherwise, keep the current value (preserve user input)
          }
          return next;
        });
        
        setTimeout(() => {
          isUpdatingFromParent.current = false;
        }, 0);
      }
    }, [revealedLetters, initialCells, wordLength, wasRevealedPositions]);

    // Handle force clear (for shake animation)
    useEffect(() => {
      if (forceClear) {
        // Add fade-out effect before clearing
        const inputs = inputsRef.current;
        inputs.forEach((input, index) => {
          if (input && !locked[index] && !revealedLetters?.has(index)) {
            input.style.transition = 'opacity 0.3s ease-out';
            input.style.opacity = '0';
          }
        });
        
        // Clear the cells after fade-out
        setTimeout(() => {
          isUpdatingFromParent.current = true;
          setCells(prev => {
            const next = prev.slice();
            for (let i = 0; i < wordLength; i++) {
              if (!locked[i]) {
                next[i] = '';
              }
            }
            return next;
          });
          
          // Reset opacity and clear flag after state update
          setTimeout(() => {
            inputs.forEach((input, index) => {
              if (input && !locked[index] && !revealedLetters?.has(index)) {
                input.style.opacity = '1';
                input.style.transition = '';
              }
            });
            isUpdatingFromParent.current = false;
          }, 50);
        }, 300); // Wait for fade-out to complete
      }
    }, [forceClear, wordLength, locked, revealedLetters]);

    // TEMPORARILY DISABLED: Handle fade-out clear (for successful submissions)
    useEffect(() => {
      if (fadeOutClear) {
        // TEMPORARILY DISABLED: All fade-out and clearing logic
        console.log('FADE-OUT CLEAR DISABLED - keeping input row intact');
        
        // TEMPORARILY DISABLED: Add fade-out effect to all non-locked cells
        // const tilePanels = tilePanelRefs.current;
        // tilePanels.forEach((tilePanel, index) => {
        //   if (tilePanel && !locked[index]) {
        //     tilePanel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        //     tilePanel.style.transform = 'scale(0.8)';
        //     tilePanel.style.opacity = '0';
        //   } 
        // });
        
        // TEMPORARILY DISABLED: After fade-out completes, clear the cells and notify parent
        // setTimeout(() => {
        //   // Clear all non-locked cells
        //   setCells(prev => {
        //     const next = prev.map((cell, index) => {
        //       if (locked[index]) {
        //         return cell;
        //       } else {
        //       } else {
        //         return '';
        //       }
        //     });
        //     return next;
        //   });
          
        //   // Notify parent of the cleared cells
        //   setTimeout(() => {
        //     const clearedCells = Array.from({ length: wordLength }, (_, i) => 
        //       locked[i] ? cells[i] : ''
        //     );
        //     onChange(clearedCells);
        //   }, 0);
          
        //   // Prevent initialCells from overriding our clear operation
        //   isUpdatingFromParent.current = true;
        //   setTimeout(() => {
        //     isUpdatingFromParent.current = false;
        //   }, 100);
          
        //   // Reset opacity, transform, and transition styles
        //   tilePanels.forEach((tilePanel, index) => {
        //       if (tilePanel && !locked[index]) {
        //         tilePanel.style.opacity = '1';
        //         tilePanel.style.transform = '';
        //         tilePanel.style.transition = '';
        //       }
        //     });
          
        //   // Notify parent that fade-out is complete
        //   onFadeOutComplete?.();
        // }, 300); // 300ms fade duration
      }
    }, [fadeOutClear, wordLength, locked, onFadeOutComplete, onChange, cells]);

    // bubble changes - only when cells actually change
    useEffect(() => {
      // Skip onChange when cells are being updated from parent
      if (isUpdatingFromParent.current) return;
      onChange(cells);
    }, [cells, onChange]);

    // helpers to locate indices
    const firstEditableIndex = useMemo(() => {
      for (let i = 0; i < wordLength; i++) {
        if (!locked[i]) return i;
      }
      return -1;
    }, [locked, wordLength]);

    const firstEmptyEditableIndex = useMemo(() => {
      for (let i = 0; i < wordLength; i++) {
        if (!locked[i] && !cells[i]) return i;
      }
      return -1;
    }, [cells, locked, wordLength]);

    // expose focus API to parent
    useImperativeHandle(ref, () => ({
      focusFirstEditable() {
        // Don't focus for won/lost games
        if (gameStatus === 'won' || gameStatus === 'lost') {
          return;
        }
        
        const i = firstEditableIndex >= 0 ? firstEditableIndex : 0;
        if (i >= 0 && !locked[i]) {
          inputsRef.current[i]?.focus();
          inputsRef.current[i]?.select?.();
        }
      },
      focusFirstEmptyEditable() {
        // Don't focus for won/lost games
        if (gameStatus === 'won' || gameStatus === 'lost') {
          return;
        }
        
        const i =
          firstEmptyEditableIndex >= 0
            ? firstEmptyEditableIndex
            : firstEmptyEditableIndex >= 0
            ? firstEmptyEditableIndex
            : 0;
        if (i >= 0 && !locked[i]) {
          inputsRef.current[i]?.focus();
          inputsRef.current[i]?.select?.();
        }
      },
      clearInputs() {
        setCells(prev => {
          const next = prev.map((cell, index) => 
            locked[index] ? cell : ''
          );
          return next;
        });
      },
    }), [firstEditableIndex, firstEmptyEditableIndex, locked, gameStatus]);

    // handle typing *only* in editable cells; jump over locked ones
    function handleChangeAt(i: number, val: string) {
      if (locked[i]) return; // ignore edits to locked cells only
      const ch = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
            
      setCells(prev => {
        if (!ch) return prev; // nothing typed
        const next = prev.slice();
        next[i] = ch;
        return next;
      });
      
      // advance focus to next editable ONLY if this wasn't a previously revealed letter position
      // (to allow users to type in positions that were just unlocked)
      const wasRevealed = wasRevealedPositions && wasRevealedPositions.has(i);
      
      if (!wasRevealed) {
        for (let j = i + 1; j < wordLength; j++) {
          if (!locked[j]) {
            inputsRef.current[j]?.focus();
            inputsRef.current[j]?.select?.();
            break;
          }
        }
      } 
    }

    function handleKeyDownAt(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Backspace') {
        if (!locked[i] && cells[i]) {
          // delete current cell
          setCells(prev => {
            const next = prev.slice();
            next[i] = '';
            return next;
          });
          // stay on this input
          requestAnimationFrame(() => {
            inputsRef.current[i]?.focus();
            inputsRef.current[i]?.select?.();
          });
        } else {
          // jump backward to previous editable with a value
          for (let j = i - 1; j >= 0; j--) {
            if (!locked[j]) {
              setCells(prev => {
                if (!prev[j]) return prev;
                const next = prev.slice();
                next[j] = '';
                return next;
              });
              requestAnimationFrame(() => {
                inputsRef.current[j]?.focus();
                inputsRef.current[j]?.select?.();
              });
              break;
            }
          }
        }
      }
      if (e.key === 'ArrowLeft') {
        for (let j = i - 1; j >= 0; j--) {
          if (!locked[j]) {
            inputsRef.current[j]?.focus();
            inputsRef.current[j]?.select?.();
            break;
          }
        }
      }
      if (e.key === 'ArrowRight') {
        for (let j = i + 1; j < wordLength; j++) {
          if (!locked[j]) {
            inputsRef.current[j]?.focus();
            inputsRef.current[j]?.select?.();
            break;
          }
        }
      }
    }

    return (
      <div className={`flex justify-center ${isShaking ? 'animate-shake' : ''}`}>
        <div className={`grid gap-1 md:gap-1 grid-cols-${wordLength}`}>
          {Array.from({ length: wordLength }).map((_, i) => {
            const isLocked = !!locked[i];
            const isRevealed = revealedLetters?.has(i);
            

            
            // For end-of-game reveal, show green styling for solution letters
            const isEndGameReveal = gameStatus === 'won' || gameStatus === 'lost';
            // Show green styling for locked letters, revealed letters, or end-game reveal
            const stateClasses = isLocked || isRevealed || (isEndGameReveal && cells[i])
              ? `bg-green-600 text-white cursor-default ${showFadeIn ? 'animate-fade-in-green' : ''}` 
              : 'bg-white text-gray-900';
            

            
            return (
              <div key={i} className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
                <div 
                  ref={(el: HTMLDivElement | null) => { tilePanelRefs.current[i] = el; }}
                  className={`tile-panel flex items-center justify-center text-center font-semibold uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d ${stateClasses}`}
                >
                  <input
                    ref={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
                    data-role="active-cell"
                    data-index={i}
                    data-locked={isLocked}
                    data-revealed={isRevealed}
                    className={`w-full h-full text-center bg-transparent border-none outline-none font-semibold uppercase text-lg md:text-lg lg:text-xl ${
                      gameStatus === 'won' || gameStatus === 'lost' 
                        ? '' 
                        : 'focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 focus:rounded'
                    }`}
                    value={cells[i] ?? ''}
                    readOnly={(() => {
                      const finalReadOnly = readOnly || isLocked;
                      return finalReadOnly;
                    })()}
                    tabIndex={readOnly || isLocked || gameStatus === 'won' || gameStatus === 'lost' ? -1 : 0}
                    onChange={e => {
                      handleChangeAt(i, e.target.value);
                    }}
                    onKeyDown={e => handleKeyDownAt(i, e)}
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                {isRevealed && isLocked && cells[i] && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-600 rounded-full p-0.5">
                    <AArrowDown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

GuessInputRow.displayName = 'GuessInputRow';
export default GuessInputRow;