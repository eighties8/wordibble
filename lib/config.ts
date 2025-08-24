export const GAME_CONFIG = {
  WORD_LENGTH: 5 as 5 | 6,              // switch between 5 or 6
  MAX_GUESSES: 6,
  REVEAL_VOWELS: false,                 // show vowel positions up-front
  REVEAL_VOWEL_COUNT: 0,                // number of vowels to reveal (0..N)
  REVEAL_CLUE: true,                    // show a clue ribbon
  DAILY_PUZZLE_TIMEZONE: 'America/New_York', // date rollover
};
