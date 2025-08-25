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
import { recordResult } from '../lib/stats';
import { Brain } from 'lucide-react';
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
  wordLength: 5 | 6 | 7;
  maxGuesses: number;
  revealVowels: boolean;
  revealVowelCount: number;
  revealClue: boolean;
  randomPuzzle: boolean;
}

export default function Game() {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [settings, setSettings] = useState<GameSettings>({
    wordLength: GAME_CONFIG.WORD_LENGTH,
    maxGuesses: GAME_CONFIG.MAX_GUESSES,
    revealVowels: GAME_CONFIG.REVEAL_VOWELS,
    revealVowelCount: GAME_CONFIG.REVEAL_VOWEL_COUNT,
    revealClue: GAME_CONFIG.REVEAL_CLUE,
    randomPuzzle: GAME_CONFIG.RANDOM_PUZZLE,
  });

  const [gameState, setGameState] = useState<GameState>({
    wordLength: GAME_CONFIG.WORD_LENGTH,
    secretWord: '',
    clue: undefined,
    attempts: [],
    lockedLetters: {},
    gameStatus: 'playing',
    attemptIndex: 0,
    revealedLetters: new Set<number>(),
    letterRevealsRemaining: 1,
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

  // Handle letter reveal
  const handleRevealLetter = useCallback(() => {
    if (gameState.letterRevealsRemaining <= 0 || gameState.gameStatus !== 'playing') {
      return;
    }

    // Find a random unrevealed position (not locked and not already revealed by lifeline)
    const unrevealedPositions = Array.from({ length: gameState.wordLength }, (_, i) => i)
      .filter(i => !gameState.lockedLetters[i] && !gameState.revealedLetters.has(i));

    if (unrevealedPositions.length > 0) {
      const randomPosition = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
      
      setGameState(prev => ({
        ...prev,
        revealedLetters: new Set(Array.from(prev.revealedLetters).concat(randomPosition)),
        letterRevealsRemaining: prev.letterRevealsRemaining - 1
      }));

      // Show success toast
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: `Revealed letter at position ${randomPosition + 1}!`,
        type: 'success'
      }]);
    }
  }, [gameState.letterRevealsRemaining, gameState.gameStatus, gameState.wordLength, gameState.revealedLetters, gameState.lockedLetters]);

  // Handle new game
  const handleNewGame = useCallback(async () => {
    try {
      // Reset game state
      setGameState({
        wordLength: settings.wordLength,
        secretWord: '',
        clue: undefined,
        attempts: [],
        lockedLetters: {},
        gameStatus: 'playing',
        attemptIndex: 0,
        revealedLetters: new Set<number>(),
        letterRevealsRemaining: 1,
      });
      
      // Reset current guess
      setCurrentGuess(new Array(settings.wordLength).fill(''));
      
      // Reset UI states
      setIsShaking(false);
      setForceClear(false);
      setToasts([]);
      
      // Set loading state
      setIsLoading(true);
      
      // Load new puzzle and dictionary
      const [puzzle, dict] = await Promise.all([
        loadDailyPuzzle(settings.wordLength, settings.randomPuzzle),
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

      // Update game state with new puzzle
      setGameState(prev => ({
        ...prev,
        secretWord: puzzle.word,
        clue: puzzle.clue,
        lockedLetters,
        revealedLetters: new Set<number>(),
        letterRevealsRemaining: 1,
      }));
      
      setDictionary(dict);
      setIsLoading(false);
      
      // Focus first empty cell
      setTimeout(() => {
        queueFocusFirstEmpty();
      }, 100);
      
    } catch (error) {
      console.error('Error starting new game:', error);
      addToast('Failed to start new game', 'error');
      setIsLoading(false);
    }
  }, [settings.wordLength, settings.randomPuzzle, settings.revealVowels, settings.revealVowelCount]);

  // ===== Debug flag (persisted) =====
  useEffect(() => {
    const savedDebugMode = localStorage.getItem('wordibble-debug-mode');
    if (savedDebugMode) setDebugMode(JSON.parse(savedDebugMode));
  }, []);
  useEffect(() => {
    localStorage.setItem('wordibble-debug-mode', JSON.stringify(debugMode));
  }, [debugMode]);

  // ===== Settings (persisted) =====
  useEffect(() => {
    const savedSettings = localStorage.getItem('wordibble-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Ensure wordLength is properly typed
        const typedSettings = {
          ...parsed,
          wordLength: Number(parsed.wordLength) as 5 | 6 | 7,
          randomPuzzle: parsed.randomPuzzle ?? false
        };
        console.log('Loaded settings from localStorage:', typedSettings);
        setSettings(typedSettings);
        // Update game state if word length changed
        if (typedSettings.wordLength !== gameState.wordLength) {
          setGameState(prev => ({ ...prev, wordLength: typedSettings.wordLength }));
        }
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    } else {
      console.log('No saved settings found, using defaults:', settings);
    }
  }, []);

  // Update game state when settings change
  useEffect(() => {
    console.log('Settings changed:', settings);
    if (settings.wordLength !== gameState.wordLength) {
      setGameState(prev => ({ ...prev, wordLength: settings.wordLength }));
    }
  }, [settings.wordLength, gameState.wordLength, settings]);

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
        console.log('Starting to load game data...');
        const [puzzle, dict] = await Promise.all([
          loadDailyPuzzle(settings.wordLength, settings.randomPuzzle),
          loadDictionary(settings.wordLength),
        ]);

        console.log('Game data loaded successfully:', { puzzle: puzzle.word, dictSize: dict.size });

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
          revealedLetters: new Set<number>(),
          letterRevealsRemaining: 1,
        }));
        setDictionary(dict);
        console.log('Game state updated successfully');
      } catch (error) {
        console.error('Error loading game data:', error);
        addToast('Failed to load game data', 'error');
      } finally {
        if (alive) {
          setIsLoading(false);
          console.log('Loading completed, setting loading to false');
          // Focus after mount
          queueFocusFirstEmpty();
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.wordLength, settings.revealVowels, settings.revealVowelCount, settings.randomPuzzle]);

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

    // Record stats for completed game
    const todayISO = new Date().toISOString().slice(0, 10);
    recordResult(
      {
        dateISO: todayISO,
        wordLength: GAME_CONFIG.WORD_LENGTH as 5 | 6 | 7,
        won: isWin,
        guesses: isWin ? (gameState.attemptIndex + 1) : adjustedMaxGuesses,
        solution: gameState.secretWord,
        mode: {
          revealVowels: GAME_CONFIG.REVEAL_VOWELS,
          vowelCount: GAME_CONFIG.REVEAL_VOWEL_COUNT,
          revealClue: GAME_CONFIG.REVEAL_CLUE,
        },
      },
      adjustedMaxGuesses
    );

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
    
    // Include initially revealed letters (locked letters) as correct
    for (const [indexStr, letter] of Object.entries(gameState.lockedLetters)) {
      if (letter) {
        states[letter] = 'correct';
      }
    }
    
    // Include letters revealed by lifeline as correct (these should never be overridden)
    for (const index of Array.from(gameState.revealedLetters)) {
      const letter = gameState.secretWord[index];
      if (letter) {
        states[letter] = 'correct';
      }
    }
    
    // Include letters from previous attempts (but don't override 'correct' states)
    for (const attempt of gameState.attempts) {
      const evaln = evaluateGuess(attempt, gameState.secretWord);
      for (let i = 0; i < attempt.length; i++) {
        const L = attempt[i];
        const s = evaln[i];
        // Only set state if it's not already 'correct' (preserving revealed letters)
        if (s === 'correct' && states[L] !== 'correct') {
          states[L] = 'correct';
        } else if (s === 'present' && states[L] !== 'correct') {
          states[L] = 'present';
        } else if (s === 'absent' && !states[L]) {
          states[L] = 'absent';
        }
      }
    }
    return states;
  }, [gameState.attempts, gameState.secretWord, gameState.lockedLetters, gameState.revealedLetters]);

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
        // DOM fallback: focus first input with data-role="active-cell" that is not [data-locked="true"] or [data-revealed="true"] and empty
        const el = document.querySelector<HTMLInputElement>(
          'input[data-role="active-cell"][data-locked="false"][data-revealed="false"][value=""]'
        ) || document.querySelector<HTMLInputElement>('input[data-role="active-cell"][data-locked="false"][data-revealed="false"]');
        el?.focus();
        el?.select?.();
      }
    });
  }
  function queueFocusSpecificIndex(i: number) {
    requestAnimationFrame(() => {
      // Only focus if the cell is not locked or revealed
      if (gameState.lockedLetters[i] || gameState.revealedLetters.has(i)) return;
      
      // Try a convention: inputs annotated with data-index
      const el = document.querySelector<HTMLInputElement>(
        `input[data-role="active-cell"][data-index="${i}"]`
      );
      if (el && el.getAttribute('data-locked') !== 'true' && el.getAttribute('data-revealed') !== 'true') {
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

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Game component error:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error state if there's an error
  if (hasError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

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
              <ClueRibbon 
          clue={gameState.clue} 
          targetWord={debugMode ? gameState.secretWord : undefined}
          onRevealLetter={settings.revealClue ? handleRevealLetter : undefined}
          letterRevealsRemaining={settings.revealClue ? gameState.letterRevealsRemaining : 0}
        />
            </div>
          )}
          {/* Debug: Show clue info */}
          {debugMode && (
            <div className="text-center mb-4 text-xs text-gray-500">
              <div>Clue: {gameState.clue || 'undefined'}</div>
              <div>Reveal Clue: {settings.revealClue ? 'true' : 'false'}</div>
              <div>Secret Word: {gameState.secretWord}</div>
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
                gameState.lockedLetters[i] || 
                (gameState.revealedLetters.has(i) ? gameState.secretWord[i] : '') ||
                currentGuess[i] || ''
              )}
              onChange={handleGuessChange}
              isShaking={isShaking}
              forceClear={forceClear}
              revealedLetters={gameState.revealedLetters}
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
              <Brain className="inline-block w-5 h-5 mr-2" /> Crushed it in {gameState.attemptIndex} tries!
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
                onClick={handleNewGame}
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
                revealedLetters={new Set(Array.from(gameState.revealedLetters).map(i => gameState.secretWord[i]))}
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
          debugMode={debugMode}
        />

      {/* Toasts */}
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}