export const GAME_CONFIG = {
  WORD_LENGTH: 5 as 5 | 6 | 7,              // switch between 5, 6, or 7
  MAX_GUESSES: 6,
  REVEAL_VOWELS: false,                // show vowel positions up-front
  REVEAL_VOWEL_COUNT: 0,                // number of vowels to reveal (0..N)
  REVEAL_CLUE: false,                    // show a clue ribbon
  RANDOM_PUZZLE: false,                 // random puzzle on each page load
  DAILY_PUZZLE_TIMEZONE: 'America/New_York', // date rollover
};

// Animation timing constants
export const ANIMATION_CONFIG = {
  TILE_FLIP_DELAY: 600,        // ms between each tile starting its flip
  TILE_FLIP_DURATION: 800,     // ms for each tile's flip animation to complete
  COLOR_CHANGE_PERCENT: 0.55,  // when during the flip to change colors (55%)
  FLIP_BACKFACE_COLOR: '#d1d5db', //'#d1d5db', //'#374151', // color shown during tile flip (backface)
};

// Want faster flips? Reduce TILE_FLIP_DELAY from 600ms to 400ms  
// Want slower color changes? Increase COLOR_CHANGE_PERCENT from 0.55 to 0.7
// Want longer flip animations? Increase TILE_FLIP_DURATION from 800ms to 1000ms
