import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { GAME_CONFIG } from '../lib/config';
import { GameState, Toast } from '../lib/types';
import { loadDailyPuzzle } from '../lib/daily';
import {
  loadDictionary,
  evaluateGuess,
  computeRevealsForWord,
  validateGuess,
} from '../lib/gameLogic';
import Header from './Header';
import Footer from './Footer';
import Settings from './Settings';
import GuessInputRow from './GuessInputRow';
import RowHistory from './RowHistory';
import ClueRibbon from './ClueRibbon';
import ToastComponent from './Toast';
import Keyboard from './Keyboard';
import type { GuessInputRowHandle } from './GuessInputRow';

type InputRowHandle = {
  /** Move focus to the first editable (non-locked, empty) cell */
  focusFirstEmptyEditable: () => void;
  /** Move focus to the first editable (non-locked) cell even if filled */
  focusFirstEditable: () => void;
};

interface GameSettings {
  wordLength: 5 | 6;
  maxGuesses: number;
  revealVowels: boolean;
  revealVowelCount: number;
  revealClue: boolean;
}

export default function Game() {
  const [settings, setSettings] = useState<GameSettings>({
    wordLength: GAME_CONFIG.WORD_LENGTH,
    maxGuesses: GAME_CONFIG.MAX_GUESSES,
    revealVowels: GAME_CONFIG.REVEAL_VOWELS,
    revealVowelCount: GAME_CONFIG.REVEAL_VOWEL_COUNT,
    revealClue: GAME_CONFIG.REVEAL_CLUE,
  });

  const [gameState, setGameState] = useState<GameState>({
    wordLength: GAME_CONFIG.WORD_LENGTH,
    secretWord: '',
    clue: undefined,
    attempts: [],
    lockedLetters: {},
    gameStatus: 'playing',
    attemptIndex: 0,
  });

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [forceClear, setForceClear] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Imperative handle to control focus inside GuessInputRow
  // const inputRowRef = useRef<InputRowHandle | null>(null);
  const inputRowRef = useRef<GuessInputRowHandle | null>(null);
  
  // Flag to prevent input row onChange during keyboard input
  const keyboardInputInProgress = useRef(false);

  // ===== Debug flag (persisted) =====
  useEffect(() => {
    const savedDebugMode = localStorage.getItem('wordup-debug-mode');
    if (savedDebugMode) setDebugMode(JSON.parse(savedDebugMode));
  }, []);
  useEffect(() => {
    localStorage.setItem('wordup-debug-mode', JSON.stringify(debugMode));
  }, [debugMode]);

  // ===== Settings (persisted) =====
  useEffect(() => {
    const savedSettings = localStorage.getItem('wordup-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        // Update game state if word length changed
        if (parsed.wordLength !== gameState.wordLength) {
          setGameState(prev => ({ ...prev, wordLength: parsed.wordLength }));
        }
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  // Update game state when settings change
  useEffect(() => {
    if (settings.wordLength !== gameState.wordLength) {
      setGameState(prev => ({ ...prev, wordLength: settings.wordLength }));
    }
  }, [settings.wordLength, gameState.wordLength]);

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    // Update game state if word length changed
    if (newSettings.wordLength !== gameState.wordLength) {
      setGameState(prev => ({ ...prev, wordLength: newSettings.wordLength }));
    }
    // Reload game with new settings
    window.location.reload();
  }, [gameState.wordLength]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '0') {
        e.preventDefault();
        setDebugMode((p) => !p);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ===== Initialize guess row length =====
  useEffect(() => {
    if (gameState.wordLength > 0) {
      setCurrentGuess((prev) => {
        if (prev.length === gameState.wordLength) return prev;
        return new Array(gameState.wordLength).fill('');
      });
    }
  }, [gameState.wordLength]);

  // ===== Calculate adjusted max guesses based on revealed letters =====
  const adjustedMaxGuesses = useMemo(() => {
    const revealedLetterCount = Object.keys(gameState.lockedLetters).length;
    
    // If REVEAL_CLUE is false and only 1 letter is revealed, add 1 to max guesses
    if (!settings.revealClue && revealedLetterCount === 1) {
      return settings.maxGuesses + 1;
    }
    
    // If there's a clue AND 2 or more vowels revealed, reduce max guesses by 2
    if (settings.revealClue && revealedLetterCount >= 2) {
      return Math.max(3, settings.maxGuesses - 2); // Ensure minimum of 3 guesses
    }
    
    return settings.maxGuesses;
  }, [gameState.lockedLetters, settings.revealClue, settings.maxGuesses]);

  // ===== Load daily puzzle + dictionary =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [puzzle, dict] = await Promise.all([
          loadDailyPuzzle(settings.wordLength),
          loadDictionary(settings.wordLength),
        ]);

        const revealedMask = computeRevealsForWord(puzzle.word, {
          revealVowels: settings.revealVowels,
          vowelCount: settings.revealVowelCount,
        });

        const lockedLetters: Record<number, string | null> = {};
        revealedMask.forEach((isLocked, i) => {
          if (isLocked) lockedLetters[i] = puzzle.word[i];
        });

        if (!alive) return;

        setGameState((prev) => ({
          ...prev,
          secretWord: puzzle.word,
          clue: puzzle.clue,
          lockedLetters,
        }));
        setDictionary(dict);
      } catch {
        addToast('Failed to load game data', 'error');
      } finally {
        if (alive) setIsLoading(false);
        // Focus after mount
        queueFocusFirstEmpty();
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.wordLength, settings.revealVowels, settings.revealVowelCount]);

  // ===== Keep currentGuess aligned when locked letters change =====
  useEffect(() => {
    if (!gameState.secretWord) return;
    if (Object.keys(gameState.lockedLetters).length === 0) return;
    // Skip if keyboard input is in progress to prevent interference
    if (keyboardInputInProgress.current) return;

    setCurrentGuess((prev) => {
      const next = prev.length === gameState.wordLength ? [...prev] : new Array(gameState.wordLength).fill('');
      for (const [idxStr, letter] of Object.entries(gameState.lockedLetters)) {
        const i = Number(idxStr);
        if (letter) next[i] = letter;
      }
      return next;
    });
    // Don't focus here; we'll do it in targeted places
  }, [gameState.lockedLetters, gameState.secretWord, gameState.wordLength]);

  // ===== Toast helpers =====
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ===== Input row onChange -> source of truth for the active guess =====
  const handleGuessChange = useCallback((letters: string[]) => {
    // Skip updating if keyboard input is in progress to prevent race condition
    if (keyboardInputInProgress.current) return;
    setCurrentGuess(letters);
  }, []);

  // ===== Submit guess =====
  const handleSubmit = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    // Build the complete guess mixing locked + current
    const completeGuess = Array.from({ length: gameState.wordLength }, (_, i) =>
      gameState.lockedLetters[i] ?? currentGuess[i] ?? ''
    ).join('');

    if (!validateGuess(completeGuess, gameState.wordLength)) {
      addToast('Please enter a complete word', 'error');
      return;
    }
    if (!dictionary.has(completeGuess)) {
      // Shake animation and reset input
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      // Clear current guess (keep locked letters)
      setCurrentGuess(() => {
        const next = new Array(gameState.wordLength).fill('');
        for (const [idxStr, letter] of Object.entries(gameState.lockedLetters)) {
          const i = Number(idxStr);
          if (letter) next[i] = letter;
        }
        return next;
      });
      
      // Trigger force clear of input row
      setForceClear(true);
      setTimeout(() => {
        setForceClear(false);
        queueFocusFirstEmpty();
      }, 100);
      
      return;
    }

    const evaluation = evaluateGuess(completeGuess, gameState.secretWord);
    const isWin = evaluation.every((s) => s === 'correct');

    // Update locked letters for exact matches
    const newLocked = { ...gameState.lockedLetters };
    for (let i = 0; i < evaluation.length; i++) {
      if (evaluation[i] === 'correct') newLocked[i] = completeGuess[i];
    }

    // Update state
    setGameState((prev) => {
      const newAttempts = prev.attempts.length
        ? [...prev.attempts, completeGuess]
        : [completeGuess];
      const nextAttemptIndex = prev.attemptIndex + 1;

      let newStatus: GameState['gameStatus'] = 'playing';
      if (isWin) {
        newStatus = 'won';
        addToast('Congratulations! You won!', 'success');
      } else if (nextAttemptIndex >= adjustedMaxGuesses) {
        newStatus = 'lost';
        addToast(`Game over! The word was ${prev.secretWord}`, 'error');
      }

      return {
        ...prev,
        attempts: newAttempts,
        attemptIndex: nextAttemptIndex,
        lockedLetters: newLocked,
        gameStatus: newStatus,
      };
    });

    // Reset current guess to only the locked positions (greens)
    setCurrentGuess(() => {
      const next = new Array(gameState.wordLength).fill('');
      for (const [idxStr, letter] of Object.entries(newLocked)) {
        const i = Number(idxStr);
        if (letter) next[i] = letter;
      }
      return next;
    });

    // Focus first empty editable after render commit
    queueFocusFirstEmpty();
  }, [
    gameState.gameStatus,
    gameState.wordLength,
    gameState.lockedLetters,
    gameState.secretWord,
    currentGuess,
    dictionary,
    addToast,
    adjustedMaxGuesses,
  ]);

  // ===== Global Enter handler =====
  const handleEnterKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameState.gameStatus === 'playing') handleSubmit();
    },
    [handleSubmit, gameState.gameStatus]
  );
  useEffect(() => {
    document.addEventListener('keydown', handleEnterKey);
    return () => document.removeEventListener('keydown', handleEnterKey);
  }, [handleEnterKey]);

  // ===== Virtual keyboard handlers =====
  const findNextEditableIndex = useCallback((fromIndex: number) => {
    // Find next editable cell starting from fromIndex + 1
    for (let i = fromIndex + 1; i < gameState.wordLength; i++) {
      if (!gameState.lockedLetters[i]) {
        return i;
      }
    }
    return -1; // No more editable cells
  }, [gameState.wordLength, gameState.lockedLetters]);

  const findFirstEditableIndex = useCallback(() => {
    // Find first editable cell
    for (let i = 0; i < gameState.wordLength; i++) {
      if (!gameState.lockedLetters[i]) {
        return i;
      }
    }
    return -1; // No editable cells
  }, [gameState.wordLength, gameState.lockedLetters]);

  const findFirstEmptyEditableIndex = useCallback(() => {
    // Find first editable cell that is empty
    for (let i = 0; i < gameState.wordLength; i++) {
      if (!gameState.lockedLetters[i] && !currentGuess[i]) {
        return i;
      }
    }
    // If no empty editable cells, return first editable cell
    return findFirstEditableIndex();
  }, [currentGuess, gameState.wordLength, gameState.lockedLetters, findFirstEditableIndex]);

  const handleKeyboardKeyPress = useCallback(
    (key: string) => {
      console.log('Keyboard key pressed:', key, 'Game status:', gameState.gameStatus);
      if (gameState.gameStatus !== 'playing') return;
      
      const i = findFirstEmptyEditableIndex();
      console.log('Found editable index:', i, 'Current guess:', currentGuess, 'Locked letters:', gameState.lockedLetters);
      if (i >= 0) {
        // Set flag to prevent input row onChange interference
        keyboardInputInProgress.current = true;
        
        setCurrentGuess((prev) => {
          const next = [...prev];
          next[i] = key;
          console.log('Updated current guess:', next);
          return next;
        });
        
        // Clear flag after state update
        setTimeout(() => {
          keyboardInputInProgress.current = false;
        }, 0);
        
        // Advance to next editable cell
        setTimeout(() => {
          const nextIndex = findNextEditableIndex(i);
          console.log('Moving to next index:', nextIndex);
          if (nextIndex >= 0) {
            queueFocusSpecificIndex(nextIndex);
          }
        }, 50);
      }
    },
    [gameState.gameStatus, findFirstEmptyEditableIndex, findNextEditableIndex, currentGuess, gameState.lockedLetters]
  );

  const handleKeyboardBackspace = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    // Find last filled editable cell
    let i = -1;
    for (let j = currentGuess.length - 1; j >= 0; j--) {
      if (!gameState.lockedLetters[j] && currentGuess[j]) {
        i = j;
        break;
      }
    }
    
    if (i >= 0) {
      // Set flag to prevent input row onChange interference
      keyboardInputInProgress.current = true;
      
      setCurrentGuess((prev) => {
        const next = [...prev];
        next[i] = '';
        return next;
      });
      
      // Clear flag after state update
      setTimeout(() => {
        keyboardInputInProgress.current = false;
      }, 0);
      
      // Keep focus on the cell where deletion occurred
      setTimeout(() => {
        queueFocusSpecificIndex(i);
      }, 50);
    }
  }, [gameState.gameStatus, currentGuess, gameState.lockedLetters]);

  // ===== Memoized keyboard letter states =====
  const keyboardLetterStates = useMemo(() => {
    const states: Record<string, 'correct' | 'present' | 'absent'> = {};
    for (const attempt of gameState.attempts) {
      const evaln = evaluateGuess(attempt, gameState.secretWord);
      for (let i = 0; i < attempt.length; i++) {
        const L = attempt[i];
        const s = evaln[i];
        if (s === 'correct') states[L] = 'correct';
        else if (s === 'present' && states[L] !== 'correct') states[L] = 'present';
        else if (s === 'absent' && !states[L]) states[L] = 'absent';
      }
    }
    return states;
  }, [gameState.attempts, gameState.secretWord]);

  // ===== Memoize row evaluations so we don't recompute every render =====
  const historyEvaluations = useMemo(() => {
    return gameState.attempts.map((attempt) => evaluateGuess(attempt, gameState.secretWord));
  }, [gameState.attempts, gameState.secretWord]);

  // ===== Focus helpers =====
  function queueFocusFirstEmpty() {
    // Wait a tick for the input row to mount/update
    requestAnimationFrame(() => {
      if (inputRowRef.current?.focusFirstEmptyEditable) {
        inputRowRef.current.focusFirstEmptyEditable();
      } else {
        // DOM fallback: focus first input with data-role="active-cell" that is not [data-locked="true"] and empty
        const el = document.querySelector<HTMLInputElement>(
          'input[data-role="active-cell"][data-locked="false"][value=""]'
        ) || document.querySelector<HTMLInputElement>('input[data-role="active-cell"][data-locked="false"]');
        el?.focus();
        el?.select?.();
      }
    });
  }
  function queueFocusSpecificIndex(i: number) {
    requestAnimationFrame(() => {
      // Only focus if the cell is not locked
      if (gameState.lockedLetters[i]) return;
      
      // Try a convention: inputs annotated with data-index
      const el = document.querySelector<HTMLInputElement>(
        `input[data-role="active-cell"][data-index="${i}"]`
      );
      if (el && el.getAttribute('data-locked') !== 'true') {
        el.focus();
        el.select?.();
      }
    });
  }

  // Focus at game start (when loading finishes)
  useEffect(() => {
    if (!isLoading && gameState.secretWord) queueFocusFirstEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, gameState.secretWord, gameState.lockedLetters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl text-gray-900">Loading game...</div>
      </div>
    );
  }

  const attemptsLeft = adjustedMaxGuesses - gameState.attemptIndex;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main className="flex-1 py-4 md:py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Clue Ribbon */}
          {gameState.clue && settings.revealClue && (
            <div className="text-center mb-4 md:mb-8">
              <ClueRibbon clue={gameState.clue} targetWord={debugMode ? gameState.secretWord : undefined} />
            </div>
          )}

          {/* Game Grid */}
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-8">
            {/* Active Input Row */}
            <GuessInputRow
              ref={inputRowRef as any}
              key={`input-${Object.keys(gameState.lockedLetters).length}-${gameState.attemptIndex}`}
              wordLength={gameState.wordLength}
              locked={Array.from({ length: gameState.wordLength }, (_, i) => !!gameState.lockedLetters[i])}
              initialCells={Array.from({ length: gameState.wordLength }, (_, i) => 
                gameState.lockedLetters[i] || currentGuess[i] || ''
              )}
              onChange={handleGuessChange}
              isShaking={isShaking}
              forceClear={forceClear}
            />

            {/* History Rows */}
            {gameState.attempts.slice(0, gameState.gameStatus === 'won' ? -1 : undefined).map((attempt, index) => (
              <RowHistory
                key={index}
                guess={attempt}
                evaluation={historyEvaluations[index]}
                wordLength={gameState.wordLength}
              />
            ))}
          </div>

          {/* Guesses Left */}
          {gameState.gameStatus === 'playing' && (
            <div className="text-center mb-4">
              <span className="text-gray-900 text-lg">{attemptsLeft} guesses left</span>
              {debugMode && (
                <span className="ml-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">DEBUG</span>
              )}
            </div>
          )}

          {/* Game Status */}
          {gameState.gameStatus === 'won' && (
            <div className="text-center text-green-600 font-semibold text-lg mb-4">
              🎉 You won in {gameState.attemptIndex} tries!
            </div>
          )}
          {gameState.gameStatus === 'lost' && (
            <div className="text-center text-red-600 font-semibold text-lg mb-4">
              Game over! The word was {gameState.secretWord}
            </div>
          )}

          {/* New Game Button */}
          {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                New Game
              </button>
            </div>
          )}

          {/* Virtual Keyboard */}
          {gameState.gameStatus === 'playing' && (
            <div className="mt-4 md:mt-8">
              <Keyboard
                onKeyPress={handleKeyboardKeyPress}
                onEnter={handleSubmit}
                onBackspace={handleKeyboardBackspace}
                letterStates={keyboardLetterStates}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Settings Overlay */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
        currentSettings={settings}
      />

      {/* Toasts */}
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}