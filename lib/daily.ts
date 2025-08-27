import { DailyPuzzle, PuzzleData, CluesData } from './types';
import { getESTDateString } from './timezone';

export async function loadDailyPuzzle(wordLength: 5 | 6 | 7, randomMode = false): Promise<DailyPuzzle> {
  try {
    
    // Load puzzles and clues based on word length from lib directory
    const [puzzlesResponse, cluesResponse] = await Promise.all([
      fetch(`/api/puzzles?length=${wordLength}${randomMode ? '&random=true' : ''}`),
      fetch(`/api/clues?length=${wordLength}`)
    ]);

    if (!puzzlesResponse.ok || !cluesResponse.ok) {
      throw new Error('Failed to load puzzle data');
    }

    const puzzles: PuzzleData[] = await puzzlesResponse.json();
    const clues: CluesData = await cluesResponse.json();

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

    const clue = clues[puzzle.word.toLowerCase()] || "I literally have no clue";
    
    // Use local date for isToday calculation too
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + 
                  String(now.getDate()).padStart(2, '0');
    
    return {
      word: puzzle.word.toUpperCase(),
      clue: clue,
      isToday: !randomMode && puzzle.date === today
    };
  } catch (error) {
    console.error('Error loading daily puzzle:', error);
    // Fallback to a default puzzle
    return {
      word: 'HELLO'.slice(0, wordLength),
      clue: 'A friendly greeting',
      isToday: false
    };
  }
}

export async function loadPuzzle(date: Date, wordLength: 5 | 6 | 7 = 6): Promise<DailyPuzzle> {
  try {

    
    // Load puzzles and clues based on word length from lib directory
    const [puzzlesResponse, cluesResponse] = await Promise.all([
      fetch(`/api/puzzles?length=${wordLength}`),
      fetch(`/api/clues?length=${wordLength}`)
    ]);

    if (!puzzlesResponse.ok || !cluesResponse.ok) {
      throw new Error('Failed to load puzzle data');
    }

    const puzzles: PuzzleData[] = await puzzlesResponse.json();
    const clues: CluesData = await cluesResponse.json();

    // Format the target date
    const targetDate = date.getFullYear() + '-' + 
                      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(date.getDate()).padStart(2, '0');
    

    
    const puzzle = puzzles.find(p => p.date === targetDate);
    
    if (!puzzle) {
      throw new Error(`No puzzle available for date ${targetDate}`);
    }

    const clue = clues[puzzle.word.toLowerCase()] || "I literally have no clue";

    
    // Check if this is today's puzzle
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + 
                  String(now.getDate()).padStart(2, '0');
    
    return {
      word: puzzle.word.toUpperCase(),
      clue: clue,
      isToday: puzzle.date === today
    };
  } catch (error) {
    console.error('Error loading puzzle for date:', error);
    throw error;
  }
}
