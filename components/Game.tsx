import React, { useEffect, useState, useCallback } from 'react';
import { GAME_CONFIG } from '../lib/config';
import { GameState, LetterState, Toast } from '../lib/types';
import { loadDailyPuzzle } from '../lib/daily';
import { loadDictionary, evaluateGuess, computeRevealsForWord, validateGuess } from '../lib/gameLogic';
import GuessInputRow from './GuessInputRow';
import RowHistory from './RowHistory';
import ClueRibbon from './ClueRibbon';
import ToastComponent from './Toast';
import Keyboard from './Keyboard';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    wordLength: GAME_CONFIG.WORD_LENGTH,
    secretWord: '',
    clue: undefined,
    attempts: [],
    lockedLetters: {},
    gameStatus: 'playing',
    attemptIndex: 0
  });

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize current guess with the correct length
  useEffect(() => {
    if (gameState.wordLength > 0) {
      setCurrentGuess(new Array(gameState.wordLength).fill(''));
    }
  }, [gameState.wordLength]);

  // Update current guess when locked letters change
  useEffect(() => {
    if (gameState.secretWord && Object.keys(gameState.lockedLetters).length > 0) {
      setCurrentGuess(prev => {
        const newGuess = [...prev];
        Object.entries(gameState.lockedLetters).forEach(([index, letter]) => {
          if (letter) {
            newGuess[parseInt(index)] = letter;
          }
        });
        return newGuess;
      });
    }
  }, [gameState.lockedLetters, gameState.secretWord]);

  // Load daily puzzle and dictionary
  useEffect(() => {
    async function initializeGame() {
      try {
        const [puzzle, dict] = await Promise.all([
          loadDailyPuzzle(),
          loadDictionary(GAME_CONFIG.WORD_LENGTH)
        ]);

        // Compute vowel reveals if enabled
        const revealedMask = computeRevealsForWord(puzzle.word, {
          revealVowels: GAME_CONFIG.REVEAL_VOWELS,
          vowelCount: GAME_CONFIG.REVEAL_VOWEL_COUNT
        });

        // Build locked letters object
        const lockedLetters: Record<number, string | null> = {};
        revealedMask.forEach((isLocked, index) => {
          if (isLocked) {
            lockedLetters[index] = puzzle.word[index];
          }
        });

        setGameState(prev => ({
          ...prev,
          secretWord: puzzle.word,
          clue: puzzle.clue,
          lockedLetters
        }));

        setDictionary(dict);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        addToast('Failed to load game data', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    initializeGame();
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleGuessChange = useCallback((letters: string[]) => {
    // letters array contains the complete current state (locked + editable)
    console.log('Received letters from input row:', letters);
    setCurrentGuess(letters);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (gameState.gameStatus !== 'playing') return;

    // currentGuess now contains the complete word including locked letters
    const completeGuess = currentGuess.join('');

    console.log('Current guess array:', currentGuess);
    console.log('Complete guess:', completeGuess);
    console.log('Secret word:', gameState.secretWord);

    // Validate the guess
    if (!validateGuess(completeGuess, gameState.wordLength)) {
      addToast('Please enter a complete word', 'error');
      return;
    }

    if (!dictionary.has(completeGuess)) {
      addToast('Word not in dictionary', 'error');
      return;
    }

    // Evaluate the guess
    const evaluation = evaluateGuess(completeGuess, gameState.secretWord);
    
    // Check for win
    const isWin = evaluation.every(state => state === 'correct');
    
    // Update locked letters for correct positions ONLY (exact matches)
    const newLockedLetters = { ...gameState.lockedLetters };
    evaluation.forEach((state, index) => {
      if (state === 'correct') {
        newLockedLetters[index] = completeGuess[index];
      }
    });

    // Update game state
    setGameState(prev => {
      const newAttempts = [...prev.attempts, completeGuess];
      const newAttemptIndex = prev.attemptIndex + 1;
      
      let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
      if (isWin) {
        newGameStatus = 'won';
        addToast('Congratulations! You won!', 'success');
      } else if (newAttemptIndex >= GAME_CONFIG.MAX_GUESSES) {
        newGameStatus = 'lost';
        addToast(`Game over! The word was ${prev.secretWord}`, 'error');
      }

      return {
        ...prev,
        attempts: newAttempts,
        attemptIndex: newAttemptIndex,
        lockedLetters: newLockedLetters,
        gameStatus: newGameStatus
      };
    });

    // Reset current guess to just the locked letters (green ones)
    setCurrentGuess(prev => {
      const newGuess = new Array(gameState.wordLength).fill('');
      Object.entries(newLockedLetters).forEach(([index, letter]) => {
        if (letter) {
          newGuess[parseInt(index)] = letter;
        }
      });
      console.log('Reset current guess to:', newGuess);
      return newGuess;
    });
  }, [gameState, currentGuess, dictionary, addToast, gameState.wordLength]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && gameState.gameStatus === 'playing') {
      handleSubmit();
    }
  }, [handleSubmit, gameState.gameStatus]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Keyboard input handlers
  const handleKeyboardKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;
    
    // Find the first empty editable cell
    const firstEmptyIndex = currentGuess.findIndex((letter, index) => {
      return !gameState.lockedLetters[index] && !letter;
    });
    
    if (firstEmptyIndex >= 0) {
      setCurrentGuess(prev => {
        const next = [...prev];
        next[firstEmptyIndex] = key;
        return next;
      });
    }
  }, [gameState.gameStatus, currentGuess, gameState.lockedLetters]);

  const handleKeyboardBackspace = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    // Find the last filled editable cell using reverse loop
    let lastFilledIndex = -1;
    for (let i = currentGuess.length - 1; i >= 0; i--) {
      if (!gameState.lockedLetters[i] && currentGuess[i]) {
        lastFilledIndex = i;
        break;
      }
    }
    
    if (lastFilledIndex >= 0) {
      setCurrentGuess(prev => {
        const next = [...prev];
        next[lastFilledIndex] = '';
        return next;
      });
    }
  }, [gameState.gameStatus, currentGuess, gameState.lockedLetters]);

  // Build letter states for keyboard coloring
  const letterStates = useCallback(() => {
    const states: Record<string, 'correct' | 'present' | 'absent'> = {};
    
    // Process all attempts to build letter states
    gameState.attempts.forEach(attempt => {
      const evaluation = evaluateGuess(attempt, gameState.secretWord);
      attempt.split('').forEach((letter, index) => {
        const state = evaluation[index];
        if (state === 'correct') {
          states[letter] = 'correct';
        } else if (state === 'present' && states[letter] !== 'correct') {
          states[letter] = 'present';
        } else if (state === 'absent' && !states[letter]) {
          states[letter] = 'absent';
        }
      });
    });
    
    return states;
  }, [gameState.attempts, gameState.secretWord]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-white">Loading game...</div>
      </div>
    );
  }

  const attemptsLeft = GAME_CONFIG.MAX_GUESSES - gameState.attemptIndex;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-white text-lg">{attemptsLeft} guesses left</span>
          </div>
          
          {/* DEBUG: Show target word until we get this working */}
          <div className="text-center mb-4 p-2 bg-gray-800 rounded">
            <span className="text-yellow-400 text-sm">DEBUG: Target word is </span>
            <span className="text-white font-mono text-lg">{gameState.secretWord}</span>
          </div>
          
          {gameState.clue && GAME_CONFIG.REVEAL_CLUE && (
            <ClueRibbon clue={gameState.clue} />
          )}
        </div>

        {/* Game Grid */}
        <div className="space-y-4 mb-8">
          {/* Active Input Row - ALWAYS the top row */}
          <GuessInputRow
            key={`input-${Object.keys(gameState.lockedLetters).length}-${gameState.attemptIndex}`}
            wordLength={gameState.wordLength}
            locked={Array.from({ length: gameState.wordLength }, (_, i) => !!gameState.lockedLetters[i])}
            initialCells={gameState.secretWord
              .split('')
              .map((letter, i) => gameState.lockedLetters[i] || '')}
            onChange={handleGuessChange}
          />

          {/* Debug info */}
          <div className="text-xs text-gray-400 mt-2">
            DEBUG: Locked letters: {JSON.stringify(gameState.lockedLetters)}
          </div>

          {/* History Rows - BELOW the input row, never get focus */}
          {gameState.attempts.map((attempt, index) => (
            <RowHistory
              key={index}
              guess={attempt}
              evaluation={evaluateGuess(attempt, gameState.secretWord)}
              wordLength={gameState.wordLength}
            />
          ))}
        </div>

        {/* Game Status */}
        {gameState.gameStatus === 'won' && (
          <div className="text-center text-green-400 font-semibold text-lg mb-4">
            🎉 You won in {gameState.attemptIndex} tries!
          </div>
        )}

        {gameState.gameStatus === 'lost' && (
          <div className="text-center text-red-400 font-semibold text-lg mb-4">
            Game over! The word was {gameState.secretWord}
          </div>
        )}

        {/* Submit Button */}
        {gameState.gameStatus === 'playing' && (
          <div className="text-center">
            <div className="mb-2 text-xs text-gray-400">
              DEBUG: Current guess: [{currentGuess.join(', ')}]
            </div>
            <button
              onClick={handleSubmit}
              disabled={currentGuess.filter(Boolean).length < gameState.wordLength}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Submit Guess
            </button>
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
          <Keyboard
            onKeyPress={handleKeyboardKeyPress}
            onEnter={handleSubmit}
            onBackspace={handleKeyboardBackspace}
            letterStates={letterStates()}
          />
        )}
      </div>

      {/* Toasts */}
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
