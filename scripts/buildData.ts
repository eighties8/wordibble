#!/usr/bin/env ts-node

/**
 * Script to build game data files from frequency lists
 * 
 * Usage:
 * npm run build-data
 * 
 * This script will:
 * 1. Filter words by length and ASCII letters
 * 2. Generate dict5.json and dict6.json
 * 3. Build dated puzzles{len}-2025.json from curated subsets
 */

import * as fs from 'fs';
import * as path from 'path';

interface WordFrequency {
  word: string;
  frequency: number;
}

interface PuzzleData {
  date: string;
  word: string;
}

interface CluesData {
  [word: string]: string;
}

function generateDatesForYear(year: number): string[] {
  const dates: string[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
}

function filterWord(word: string, length: number): boolean {
  return word.length === length && /^[A-Za-z]+$/.test(word);
}

function buildDictionary(words: string[], length: number): string[] {
  return words
    .filter(word => filterWord(word, length))
    .map(word => word.toUpperCase())
    .sort();
}

function buildPuzzles(words: string[], year: number): PuzzleData[] {
  const dates = generateDatesForYear(year);
  const puzzles: PuzzleData[] = [];
  
  // Use a subset of words for puzzles (every 7th word to spread them out)
  const puzzleWords = words.filter((_, index) => index % 7 === 0);
  
  dates.forEach((date, index) => {
    const wordIndex = index % puzzleWords.length;
    puzzles.push({
      date,
      word: puzzleWords[wordIndex]
    });
  });
  
  return puzzles;
}

function buildClues(words: string[]): CluesData {
  const clues: CluesData = {};
  
  // Generate simple clues (you can replace this with real clues)
  words.forEach(word => {
    clues[word] = `clue for ${word.toLowerCase()}`;
  });
  
  return clues;
}

async function main() {
  try {
    console.log('Building game data files...');
    
    // This is a placeholder - you would load your actual frequency list here
    // const frequencyList = await loadFrequencyList('path/to/frequency-list.txt');
    
    // For now, using sample data
    const sampleWords5 = [
      'HELLO', 'WORLD', 'MOUTH', 'BRAIN', 'SPACE', 'DREAM', 'LIGHT', 'WATER',
      'EARTH', 'FIRE', 'MUSIC', 'HAPPY', 'SMILE', 'PEACE', 'LOVE', 'HOPE'
    ];
    
    const sampleWords6 = [
      'MOUNTAIN', 'OCEAN', 'SUNSHINE', 'FRIEND', 'BEAUTY', 'COURAGE', 'WISDOM',
      'FREEDOM', 'JOURNEY', 'MYSTERY', 'HARMONY', 'SILENCE', 'WONDER', 'MAGIC'
    ];
    
    const dataDir = path.join(__dirname, '../public/data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Build 5-letter data
    const dict5 = buildDictionary(sampleWords5, 5);
    const puzzles5 = buildPuzzles(dict5, 2025);
    const clues5 = buildClues(dict5);
    
    // Build 6-letter data
    const dict6 = buildDictionary(sampleWords6, 6);
    const puzzles6 = buildPuzzles(dict6, 2025);
    const clues6 = buildClues(dict6);
    
    // Write files
    fs.writeFileSync(path.join(dataDir, 'dict5.json'), JSON.stringify(dict5, null, 2));
    fs.writeFileSync(path.join(dataDir, 'puzzles5-2025.json'), JSON.stringify(puzzles5, null, 2));
    fs.writeFileSync(path.join(dataDir, 'clues5.json'), JSON.stringify(clues5, null, 2));
    
    fs.writeFileSync(path.join(dataDir, 'dict6.json'), JSON.stringify(dict6, null, 2));
    fs.writeFileSync(path.join(dataDir, 'puzzles6-2025.json'), JSON.stringify(puzzles6, null, 2));
    fs.writeFileSync(path.join(dataDir, 'clues6.json'), JSON.stringify(clues6, null, 2));
    
    console.log('✅ Data files built successfully!');
    console.log(`📁 5-letter: ${dict5.length} words, ${puzzles5.length} puzzles`);
    console.log(`📁 6-letter: ${dict6.length} words, ${puzzles6.length} puzzles`);
    
  } catch (error) {
    console.error('❌ Error building data files:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
