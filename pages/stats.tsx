import React, { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { loadStats, winRate, StatsSnapshot, GameResult } from "../lib/stats";
import { loadAll, makeId, toDateISO } from "../lib/storage";

// Calculate puzzle number based on days since start date
function getPuzzleNumber(dateISO: string): number {
  const startDate = new Date('2025-08-25'); // Puzzle start date
  const puzzleDate = new Date(dateISO);
  const diffTime = puzzleDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Start from puzzle #1
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<GameResult | null>(null);
  const [showPuzzleSnapshot, setShowPuzzleSnapshot] = useState(false);

  useEffect(() => {
    // Load stats on client side to avoid hydration errors
    setStats(loadStats());
    setIsLoading(false);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  const generateAndShareEmojiGrid = (stats: StatsSnapshot) => {
    // Calculate puzzle number (starting from 8/25/25 as puzzle #1)
    const startDate = new Date('2025-08-25');
    // Use latest result's date to compute puzzle number for accuracy
    const latest = stats.results && stats.results.length > 0 ? stats.results[stats.results.length - 1] : null;
    const referenceDate = latest ? new Date(latest.dateISO) : new Date();
    const daysDiff = Math.floor((referenceDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const puzzleNumber = daysDiff + 1;

    // Get the most recent result
    if (stats.results && stats.results.length > 0) {
      const latestResult = stats.results[stats.results.length - 1];
      
      if (latestResult.won) {
        // Try to get the actual game state from new storage system for accurate emoji grid
        let guessesUsed = latestResult.guesses;
        let emojiGrid = '';
        
        try {
          // Get the puzzle state from new storage using the completed date
          // We need to find which puzzle this result belongs to
          const allPuzzles = loadAll();
          let puzzleState = null;
          
          // Look for a puzzle with matching date and word length
          for (const [puzzleId, state] of Object.entries(allPuzzles)) {
            if (state.dateISO === latestResult.dateISO && state.wordLength === latestResult.wordLength) {
              puzzleState = state;
              break;
            }
          }
          
          if (puzzleState && puzzleState.attempts && puzzleState.secretWord) {
            guessesUsed = puzzleState.attempts.length;
            emojiGrid = `Wordibble #${puzzleNumber} ${guessesUsed}/3\nhttps://wordibble.com\n`;
            // Generate accurate emoji grid from actual game state
            puzzleState.attempts.forEach((attempt: string, attemptIndex: number) => {
              let row = '';
              const wl = puzzleState.wordLength;
              const counts: Record<string, number> = {};
              for (let i = 0; i < wl; i++) {
                const ch = puzzleState.secretWord[i];
                counts[ch] = (counts[ch] || 0) + 1;
              }
              const marks: ('correct'|'present'|'absent')[] = new Array(wl).fill('absent');
              for (let i = 0; i < wl; i++) {
                if (attempt[i] && attempt[i] === puzzleState.secretWord[i]) {
                  marks[i] = 'correct';
                  counts[attempt[i]] -= 1;
                }
              }
              for (let i = 0; i < wl; i++) {
                if (marks[i] !== 'absent') continue;
                const ch = attempt[i];
                if (ch && counts[ch] > 0) {
                  marks[i] = 'present';
                  counts[ch] -= 1;
                }
              }
              for (let i = 0; i < wl; i++) {
                row += marks[i] === 'correct' ? '🟩' : marks[i] === 'present' ? '🟨' : '⬛';
              }
              emojiGrid += attemptIndex < puzzleState.attempts.length - 1 ? row + '\n' : row;
            });
          } else {
            // Fallback to placeholder if no valid game state
            emojiGrid = `Wordibble #${puzzleNumber} ${guessesUsed}/3\nhttps://wordibble.com\n`;
            emojiGrid += generatePlaceholderGrid(guessesUsed, latestResult.wordLength);
          }
        } catch (error) {
          console.error('Error getting game state from new storage:', error);
          // Fallback to placeholder
          emojiGrid = `Wordibble #${puzzleNumber} ${guessesUsed}/3\nhttps://wordibble.com\n`;
          emojiGrid += generatePlaceholderGrid(guessesUsed, latestResult.wordLength);
        }

        // Copy to clipboard
        navigator.clipboard.writeText(emojiGrid).then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = emojiGrid;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        });
      }
    }
  };

  const generatePlaceholderGrid = (guesses: number, wordLength: number) => {
    let grid = '';
    for (let i = 0; i < guesses; i++) {
      let row = '';
      for (let j = 0; j < wordLength; j++) {
        if (i === guesses - 1) {
          row += '🟩'; // Last row is all green (correct)
        } else {
          row += '⬛'; // Previous rows are all black
        }
      }
      if (i < guesses - 1) {
        grid += row + '\n';
      } else {
        grid += row;
      }
    }
    return grid;
  };

  const handlePuzzleClick = (result: GameResult) => {
    setSelectedPuzzle(result);
    setShowPuzzleSnapshot(true);
  };

  const closePuzzleSnapshot = () => {
    setShowPuzzleSnapshot(false);
    setSelectedPuzzle(null);
  };

  const getPuzzleState = (result: GameResult) => {
    try {
      const allPuzzles = loadAll();
      // Look for a puzzle with matching date and word length
      for (const [puzzleId, state] of Object.entries(allPuzzles)) {
        if (state.dateISO === result.dateISO && state.wordLength === result.wordLength) {
          return state;
        }
      }
    } catch (error) {
      console.error('Error getting puzzle state:', error);
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg z-50">
          Results copied to clipboard!
        </div>
      )}

      {/* Header */}
      <div className="text-center mt-4">
        <h1 className="text-3xl mb-2">Statistics</h1>
        <p className="text-gray-600">Your Wordibble performance</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.played}</div>
          <div className="text-sm text-gray-600">Played</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{winRate(stats)}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.maxStreak}</div>
          <div className="text-sm text-gray-600">Max Streak</div>
        </div>
      </div>

      {/* Guess Distribution */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg text-gray-900 mb-4">Guess Distribution</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((guesses) => {
            const count = stats.guessDistribution[guesses] || 0;
            const maxCount = Math.max(...Object.values(stats.guessDistribution));
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={guesses} className="flex items-center gap-2">
                <span className="w-8 text-sm text-gray-600">{guesses}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-green-600 h-6 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-900">Recent Results</h3>
          {stats.results && stats.results.length > 0 && (
            <button
              onClick={() => generateAndShareEmojiGrid(stats)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
        
        {stats.results && stats.results.length > 0 ? (
          <div className="space-y-2">
            {stats.results.slice(-10).reverse().map((result, index) => (
              <div
                key={index}
                onClick={() => handlePuzzleClick(result)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    result.won ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {result.won ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    Puzzle #{getPuzzleNumber(result.dateISO)} • {new Date(result.dateISO).toLocaleDateString()} • <span className="font-mono text-gray-500">{result.solution || 'Unknown'}</span> • {result.won ? 'Won:' : 'Lost:'} {result.won ? `${result.guesses}/3` : 'X/3'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No plays yet</p>
        )}
      </div>

      {/* Puzzle Snapshot Modal */}
      {showPuzzleSnapshot && selectedPuzzle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl text-gray-900">Puzzle Snapshot</h3>
              <button
                onClick={closePuzzleSnapshot}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Date: {new Date(selectedPuzzle.dateISO).toLocaleDateString()}</div>
                <div className="text-sm text-gray-600 mb-2">Word Length: {selectedPuzzle.wordLength} letters</div>
                <div className="text-sm text-gray-600 mb-4">Result: {selectedPuzzle.won ? `Won in ${selectedPuzzle.guesses} guesses` : 'Lost'}</div>
              </div>
              
              {selectedPuzzle.won && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      generateAndShareEmojiGrid(stats);
                      closePuzzleSnapshot();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Share This Result
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

StatsPage.title = "Stats";  // header shows "Wordibble · Stats"
StatsPage.narrow = true;     // stats uses narrower container
