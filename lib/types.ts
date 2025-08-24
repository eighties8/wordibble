export type WordLength = 5 | 6;

export type LetterState = 'correct' | 'present' | 'absent';

export interface DailyPuzzle {
  word: string;
  clue?: string;
  isToday: boolean;
}

export interface PuzzleData {
  date: string;
  word: string;
}

export interface CluesData {
  [word: string]: string;
}

export interface GameState {
  wordLength: WordLength;
  secretWord: string;
  clue?: string;
  attempts: string[];
  lockedLetters: Record<number, string | null>;
  gameStatus: 'playing' | 'won' | 'lost';
  attemptIndex: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}
