import { getJSON, setJSON } from "./storage";

export const STATS_KEY = "wordibble:stats:v1";

export type GameResult = {
  dateISO: string;          // e.g. "2025-08-24"
  wordLength: 5 | 6 | 7;
  won: boolean;
  guesses: number;          // 1..MAX_GUESSES (or MAX_GUESSES if lost)
  solution?: string;        // optional, useful for debugging
  mode?: {
    revealVowels: boolean;
    vowelCount: number;
    revealClue: boolean;
  };
};

export type StatsSnapshot = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = won in 1 guess, etc.
  lastPlayedDate?: string;     // ISO date of last recorded game
  results?: GameResult[];      // optional detailed history (bounded)
};

const DEFAULT_STATS: StatsSnapshot = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0, 0], // supports up to 7 guesses safely
  results: [],
};

// Utility: date math on YYYY-MM-DD
export function isNextDay(prevISO?: string, nextISO?: string) {
  if (!prevISO || !nextISO) return false;
  const prev = new Date(prevISO + "T00:00:00Z");
  const next = new Date(nextISO + "T00:00:00Z");
  const diff = (next.getTime() - prev.getTime()) / 86_400_000;
  return Math.round(diff) === 1;
}

export function loadStats(): StatsSnapshot {
  // Defensive clone so callers can mutate safely
  const data = getJSON<StatsSnapshot>(STATS_KEY, DEFAULT_STATS);
  // pad distribution to at least 7 slots (handles MAX_GUESSES 5..7)
  if (data.guessDistribution.length < 7) {
    data.guessDistribution = [
      ...data.guessDistribution,
      ...Array(7 - data.guessDistribution.length).fill(0),
    ];
  }
  return { ...data, guessDistribution: [...data.guessDistribution], results: [...(data.results ?? [])] };
}

export function saveStats(s: StatsSnapshot) {
  // Keep detailed history bounded (e.g., last 180 results)
  const bounded = { ...s, results: (s.results ?? []).slice(-180) };
  setJSON(STATS_KEY, bounded);
}

export function recordResult(result: GameResult, maxGuesses: number) {
  const stats = loadStats();

  stats.played += 1;
  if (result.won) {
    stats.wins += 1;
    // guessDistribution index is guesses-1 but guard to list length
    const idx = Math.min(result.guesses - 1, stats.guessDistribution.length - 1);
    stats.guessDistribution[idx] = (stats.guessDistribution[idx] ?? 0) + 1;

    // streaks (only count days with wins)
    if (isNextDay(stats.lastPlayedDate, result.dateISO)) {
      stats.currentStreak += 1;
    } else {
      // If last game wasn't yesterday, streak resets to 1 on a win today
      stats.currentStreak = 1;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    // loss breaks streak
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = result.dateISO;
  stats.results = [...(stats.results ?? []), result];

  // If project ever changes MAX_GUESSES, keep array long enough
  if (stats.guessDistribution.length < maxGuesses) {
    stats.guessDistribution.push(...Array(maxGuesses - stats.guessDistribution.length).fill(0));
  }

  saveStats(stats);
}

export function winRate(stats: StatsSnapshot) {
  return stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
}
