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
  revealedLetters?: Set<number>; // positions of letters revealed by lifeline
  readOnly?: boolean;         // make entire row read-only (e.g., completed puzzle)
  showFadeIn?: boolean;      // trigger fade-in animation for locked cells
};


const GuessInputRow = forwardRef<GuessInputRowHandle, Props>(
  ({ wordLength, locked, initialCells, onChange, isShaking, forceClear, revealedLetters, readOnly, showFadeIn }, ref) => {
    // keep a local controlled buffer to emit via onChange
    const [cells, setCells] = useState<string[]>(
      () => initialCells.slice(0, wordLength)
    );

    // refs for each input
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    
    // ref to track when cells are being updated from parent
    const isUpdatingFromParent = useRef(false);

    // keep cells in sync if parent sends new initialCells (e.g., new greens)
    useEffect(() => {
      isUpdatingFromParent.current = true;
      setCells(initialCells.slice(0, wordLength));
      
      // Clear flag after state update
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
    }, [initialCells, wordLength]);

    // Handle force clear (for shake animation)
    useEffect(() => {
      if (forceClear) {
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
        
        // Clear flag after state update
        setTimeout(() => {
          isUpdatingFromParent.current = false;
        }, 0);
      }
    }, [forceClear, wordLength, locked]);

    // bubble changes - only when cells actually change
    useEffect(() => {
      // Skip onChange when cells are being updated from parent
      if (isUpdatingFromParent.current) return;
      onChange(cells);
    }, [cells, onChange]);

    // helpers to locate indices
    const firstEditableIndex = useMemo(() => {
      for (let i = 0; i < wordLength; i++) {
        if (!locked[i] && !revealedLetters?.has(i)) return i;
      }
      return -1;
    }, [locked, wordLength, revealedLetters]);

    const firstEmptyEditableIndex = useMemo(() => {
      for (let i = 0; i < wordLength; i++) {
        if (!locked[i] && !revealedLetters?.has(i) && !cells[i]) return i;
      }
      return -1;
    }, [cells, locked, wordLength, revealedLetters]);

    // expose focus API to parent
    useImperativeHandle(ref, () => ({
      focusFirstEditable() {
        const i = firstEditableIndex >= 0 ? firstEditableIndex : 0;
        if (i >= 0 && !locked[i] && !revealedLetters?.has(i)) {
          inputsRef.current[i]?.focus();
          inputsRef.current[i]?.select?.();
        }
      },
      focusFirstEmptyEditable() {
        const i =
          firstEmptyEditableIndex >= 0
            ? firstEmptyEditableIndex
            : firstEditableIndex >= 0
            ? firstEditableIndex
            : 0;
        if (i >= 0 && !locked[i] && !revealedLetters?.has(i)) {
          inputsRef.current[i]?.focus();
          inputsRef.current[i]?.select?.();
        }
      },
      clearInputs() {
        setCells(prev => {
          const next = prev.map((cell, index) => 
            (locked[index] || revealedLetters?.has(index)) ? cell : ''
          );
          return next;
        });
      },
    }), [firstEditableIndex, firstEmptyEditableIndex, locked, revealedLetters]);

    // handle typing *only* in editable cells; jump over locked ones
    function handleChangeAt(i: number, val: string) {
      if (locked[i] || revealedLetters?.has(i)) return; // ignore edits to locked or revealed
      const ch = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
      setCells(prev => {
        if (!ch) return prev; // nothing typed
        const next = prev.slice();
        next[i] = ch;
        return next;
      });
      // advance focus to next editable
      for (let j = i + 1; j < wordLength; j++) {
        if (!locked[j] && !revealedLetters?.has(j)) {
          inputsRef.current[j]?.focus();
          inputsRef.current[j]?.select?.();
          break;
        }
      }
    }

    function handleKeyDownAt(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
      const isRevealed = revealedLetters?.has(i);
      if (e.key === 'Backspace') {
        if (!locked[i] && !isRevealed && cells[i]) {
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
            if (!locked[j] && !revealedLetters?.has(j)) {
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
          if (!locked[j] && !revealedLetters?.has(j)) {
            inputsRef.current[j]?.focus();
            inputsRef.current[j]?.select?.();
            break;
          }
        }
      }
      if (e.key === 'ArrowRight') {
        for (let j = i + 1; j < wordLength; j++) {
          if (!locked[j] && !revealedLetters?.has(j)) {
            inputsRef.current[j]?.focus();
            inputsRef.current[j]?.select?.();
            break;
          }
        }
      }
    }

    return (
      <div className={`flex justify-center ${isShaking ? 'animate-shake' : ''}`}>
        <div className={`grid gap-2 md:gap-1 grid-cols-${wordLength}`}>
          {Array.from({ length: wordLength }).map((_, i) => {
            const isLocked = !!locked[i];
            const isRevealed = revealedLetters?.has(i);
            const stateClasses = isLocked 
              ? `bg-green-500 text-white cursor-default ${showFadeIn ? 'animate-fade-in-green' : ''}` 
              : isRevealed 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-900';
            
            return (
              <div key={i} className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
                <div className={`tile-panel flex items-center justify-center text-center font-semibold uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d ${stateClasses}`}>
                  <input
                    ref={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
                    data-role="active-cell"
                    data-index={i}
                    data-locked={isLocked}
                    data-revealed={isRevealed}
                    className="w-full h-full text-center bg-transparent border-none outline-none font-semibold tracking-wider text-lg md:text-lg lg:text-xl"
                    value={cells[i] ?? ''}
                    readOnly={readOnly || isLocked || isRevealed}
                    tabIndex={readOnly || isLocked || isRevealed ? -1 : 0}
                    onChange={e => handleChangeAt(i, e.target.value)}
                    onKeyDown={e => handleKeyDownAt(i, e)}
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                {isRevealed && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 rounded-full p-0.5">
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