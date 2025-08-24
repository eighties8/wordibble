import { DailyPuzzle, PuzzleData, CluesData } from './types';

export async function loadDailyPuzzle(wordLength: 5 | 6): Promise<DailyPuzzle> {
  try {
    // Load puzzles and clues based on word length
    const [puzzlesResponse, cluesResponse] = await Promise.all([
      fetch(`/data/puzzles${wordLength}-2025.json`),
      fetch(`/data/clues${wordLength}.json`)
    ]);

    if (!puzzlesResponse.ok || !cluesResponse.ok) {
      throw new Error('Failed to load puzzle data');
    }

    const puzzles: PuzzleData[] = await puzzlesResponse.json();
    const clues: CluesData = await cluesResponse.json();

    // Get today's date in YYYY-MM-DD format (browser local time)
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's puzzle, fall back to first if missing
    let puzzle = puzzles.find(p => p.date === today);
    if (!puzzle && puzzles.length > 0) {
      puzzle = puzzles[0];
    }

    if (!puzzle) {
      throw new Error('No puzzle data available');
    }

    return {
      word: puzzle.word.toUpperCase(),
      clue: clues[puzzle.word] || "I literally have no clue",
      isToday: puzzle.date === today
    };
  } catch (error) {
    console.error('Error loading daily puzzle:', error);
    // Fallback to a default puzzle
    return {
      word: 'HELLO'.slice(0, wordLength),
      isToday: false
    };
  }
}
