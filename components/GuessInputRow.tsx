// components/GuessInputRow.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

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
};


const GuessInputRow = forwardRef<GuessInputRowHandle, Props>(
  ({ wordLength, locked, initialCells, onChange, isShaking, forceClear }, ref) => {
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
      for (let i = 0; i < wordLength; i++) if (!locked[i]) return i;
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
        const i = firstEditableIndex >= 0 ? firstEditableIndex : 0;
        if (i >= 0 && !locked[i]) {
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
        if (i >= 0 && !locked[i]) {
          inputsRef.current[i]?.focus();
          inputsRef.current[i]?.select?.();
        }
      },
      clearInputs() {
        setCells(prev => {
          const next = prev.map(cell => (locked[prev.indexOf(cell)] ? cell : ''));
          return next;
        });
      },
    }), [firstEditableIndex, firstEmptyEditableIndex, locked]);

    // handle typing *only* in editable cells; jump over locked ones
    function handleChangeAt(i: number, val: string) {
      if (locked[i]) return; // ignore edits to locked
      const ch = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
      setCells(prev => {
        if (!ch) return prev; // nothing typed
        const next = prev.slice();
        next[i] = ch;
        return next;
      });
      // advance focus to next editable
      for (let j = i + 1; j < wordLength; j++) {
        if (!locked[j]) {
          inputsRef.current[j]?.focus();
          inputsRef.current[j]?.select?.();
          break;
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
        <div className={`grid gap-0.5 md:gap-1 ${wordLength === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
          {Array.from({ length: wordLength }).map((_, i) => {
            const isLocked = !!locked[i];
            return (
              <input
                key={i}
                ref={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
                data-role="active-cell"
                data-index={i}
                data-locked={isLocked}
                className={`w-12 h-12 md:w-14 md:h-14 text-center border rounded-lg font-semibold tracking-wider text-lg md:text-xl
                  ${isLocked ? 'bg-green-500 text-white cursor-default' : 'bg-white text-gray-900 border-gray-300'}
                `}
                value={cells[i] ?? ''}
                readOnly={isLocked}
                tabIndex={isLocked ? -1 : 0}
                onChange={e => handleChangeAt(i, e.target.value)}
                onKeyDown={e => handleKeyDownAt(i, e)}
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

GuessInputRow.displayName = 'GuessInputRow';
export default GuessInputRow;