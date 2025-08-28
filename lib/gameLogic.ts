import { LetterState, WordLength } from './types';
import { GAME_CONFIG } from './config';

// Cache for dictionary words - make it word-length specific
let dictionaryCache: Map<WordLength, Set<string>> = new Map();

export async function loadDictionary(wordLength: WordLength): Promise<Set<string>> {
  // Check if we have a cached dictionary for this specific word length
  if (dictionaryCache.has(wordLength)) {
    return dictionaryCache.get(wordLength)!;
  }

  try {
  
    // Use the dictionary file from lib/data via API
    const response = await fetch(`/api/dictionary?length=${wordLength}`);
    if (!response.ok) {
      throw new Error(`Failed to load dictionary: ${response.status} ${response.statusText}`);
    }
    const words: string[] = await response.json();
    
    const wordSet = new Set(words.map(w => w.toUpperCase()));
    dictionaryCache.set(wordLength, wordSet);
    return wordSet;
  } catch (error) {
    console.error('Error loading dictionary via API, trying fallback:', error);
    
    // Fallback: try to load dictionary data directly
    try {
      // Import dictionary data directly as a fallback
      const dictionaryData = await import(`./data/dictionary${wordLength}.json`);
      const words = (dictionaryData.default || dictionaryData) as string[];

      const wordSet = new Set(words.map((w: string) => w.toUpperCase()));
      dictionaryCache.set(wordLength, wordSet);
      return wordSet;
    } catch (fallbackError) {
      console.error('Fallback dictionary loading also failed:', fallbackError);
      // Return empty set as final fallback
      return new Set();
    }
  }
}

export function evaluateGuess(guess: string, secretWord: string): LetterState[] {
  const result: LetterState[] = new Array(guess.length).fill('absent');
  const secretCounts = new Map<string, number>();
  
  // Count letters in secret word
  for (const letter of secretWord) {
    secretCounts.set(letter, (secretCounts.get(letter) || 0) + 1);
  }

  // First pass: mark correct letters
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secretWord[i]) {
      result[i] = 'correct';
      secretCounts.set(guess[i], (secretCounts.get(guess[i]) || 1) - 1);
    }
  }

  // Second pass: mark present letters (respecting counts)
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    
    const letter = guess[i];
    if (secretCounts.get(letter) && secretCounts.get(letter)! > 0) {
      result[i] = 'present';
      secretCounts.set(letter, secretCounts.get(letter)! - 1);
    }
  }

  return result;
}

export function isVowel(letter: string): boolean {
  return /[AEIOU]/i.test(letter);
}



export function validateGuess(guess: string, wordLength: WordLength): boolean {
  return guess.length === wordLength && /^[A-Z]+$/.test(guess);
}
