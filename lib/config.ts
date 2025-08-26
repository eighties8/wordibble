export const GAME_CONFIG = {
  WORD_LENGTH: 5 as 5 | 6 | 7,              // switch between 5, 6, or 7
  MAX_GUESSES: 6,
  REVEAL_VOWELS: false,                // show vowel positions up-front
  REVEAL_VOWEL_COUNT: 0,                // number of vowels to reveal (0..N)
  REVEAL_CLUE: false,                    // show a clue ribbon
  RANDOM_PUZZLE: false,                 // random puzzle on each page load
  DAILY_PUZZLE_TIMEZONE: 'America/New_York', // date rollover
};
