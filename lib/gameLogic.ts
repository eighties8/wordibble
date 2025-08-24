import { LetterState, WordLength } from './types';
import { GAME_CONFIG } from './config';

// Cache for dictionary words
let dictionaryCache: Set<string> | null = null;

export async function loadDictionary(wordLength: WordLength): Promise<Set<string>> {
  if (dictionaryCache) {
    return dictionaryCache;
  }

  try {
    // Use the dictionary file from lib/data instead of public/data
    const response = await fetch(`/api/dictionary?length=${wordLength}`);
    if (!response.ok) {
      throw new Error('Failed to load dictionary');
    }
    const words: string[] = await response.json();
    dictionaryCache = new Set(words.map(w => w.toUpperCase()));
    return dictionaryCache;
  } catch (error) {
    console.error('Error loading dictionary:', error);
    // Return empty set as fallback
    return new Set();
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

export function getVowelPositions(word: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (isVowel(word[i])) {
      positions.push(i);
    }
  }
  return positions;
}

export function getRandomVowelPositions(word: string, count: number): number[] {
  const vowelPositions = getVowelPositions(word);
  if (count >= vowelPositions.length) {
    return vowelPositions;
  }
  
  // Fisher-Yates shuffle and take first N
  const shuffled = [...vowelPositions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

export function computeRevealsForWord(
  word: string, 
  options: { revealVowels: boolean; vowelCount: number }
): boolean[] {
  if (!options.revealVowels || options.vowelCount === 0) {
    return new Array(word.length).fill(false);
  }

  const revealedPositions = getRandomVowelPositions(word, options.vowelCount);
  const mask = new Array(word.length).fill(false);
  
  for (const pos of revealedPositions) {
    mask[pos] = true;
  }
  
  return mask;
}

export function validateGuess(guess: string, wordLength: WordLength): boolean {
  return guess.length === wordLength && /^[A-Z]+$/.test(guess);
}
