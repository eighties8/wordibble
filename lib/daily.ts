import { DailyPuzzle, PuzzleData, CluesData } from './types';
import { getESTDateString } from './timezone';

// Helper function for case-agnostic clue lookup
function findClue(clues: CluesData, word: string): string {
  const normalizedWord = word.toUpperCase();
  const matchingKey = Object.keys(clues).find(key => key.toUpperCase() === normalizedWord);
  return matchingKey ? clues[matchingKey] : "I literally have no clue";
}

export async function loadDailyPuzzle(randomMode = false): Promise<DailyPuzzle> {
  try {
    
    // Load puzzles from unified file
    const puzzlesResponse = await fetch(`/api/puzzles${randomMode ? '?random=true' : ''}`);

    if (!puzzlesResponse.ok) {
      throw new Error('Failed to load puzzle data');
    }

    const puzzles: PuzzleData[] = await puzzlesResponse.json();

    let puzzle: PuzzleData | undefined;
    
    if (randomMode) {
      // Server already returned a random puzzle, just use the first (and only) one
      puzzle = puzzles[0];
    
    } else {
      // Normal date-based puzzle
      // Use EST timezone for consistent daily puzzle rollover
      const today = getESTDateString();
      puzzle = puzzles.find(p => p.date === today);
      if (!puzzle && puzzles.length > 0) {
        puzzle = puzzles[0];
      }
      
    }

    if (!puzzle) {
      throw new Error('No puzzle data available');
    }

    // Prefer embedded clue from puzzles; fallback to separate clues if missing
    let clue: string | undefined = puzzle.clue;
    if (!clue) {
      try {
        const year = puzzle.date.split('-')[0];
        const cluesResponse = await fetch(`/api/clues?year=${year}`);
        if (cluesResponse.ok) {
          const clues: CluesData = await cluesResponse.json();
          clue = findClue(clues, puzzle.word);
        }
      } catch (_) {
        // ignore and use default below
      }
    }
    
    // Use EST timezone for isToday calculation to be consistent
    const todayEST = getESTDateString();
    
    return {
      word: puzzle.word.toUpperCase(),
      clue: clue ?? 'I literally have no clue',
      isToday: !randomMode && puzzle.date === todayEST
    };
  } catch (error) {
    console.error('Error loading daily puzzle:', error);
    // Fallback to a default puzzle
    return {
      word: 'HELLO',
      clue: 'A friendly greeting',
      isToday: false
    };
  }
}

export async function loadPuzzle(date: Date): Promise<DailyPuzzle> {
  try {
    
    // Load puzzles from unified file
    const puzzlesResponse = await fetch(`/api/puzzles`);

    if (!puzzlesResponse.ok) {
      throw new Error('Failed to load puzzle data');
    }

    const puzzles: PuzzleData[] = await puzzlesResponse.json();

    // Format the target date - use the date as-is since it's already in the correct format from the URL
    const targetDate = date.getFullYear() + '-' + 
                      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(date.getDate()).padStart(2, '0');
    
    const puzzle = puzzles.find(p => p.date === targetDate);
    
    if (!puzzle) {
      throw new Error(`No puzzle available for date ${targetDate}`);
    }

    // Prefer embedded clue; fallback to separate clues
    let clue: string | undefined = puzzle.clue;
    if (!clue) {
      try {
        const year = puzzle.date.split('-')[0];
        const cluesResponse = await fetch(`/api/clues?year=${year}`);
        if (cluesResponse.ok) {
          const clues: CluesData = await cluesResponse.json();
          clue = findClue(clues, puzzle.word);
        }
      } catch (_) {
        // ignore
      }
    }

    // Check if this is today's puzzle using EST timezone
    const todayEST = getESTDateString();
    
    return {
      word: puzzle.word.toUpperCase(),
      clue: clue ?? 'I literally have no clue',
      isToday: puzzle.date === todayEST
    };
  } catch (error) {
    console.error('Error loading puzzle for date:', error);
    throw error;
  }
}
