import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { loadStats, winRate, StatsSnapshot, GameResult } from "../lib/stats";

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
      <div className="min-h-screen flex items-center justify-center">
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
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const puzzleNumber = daysDiff + 1;

    // Get the most recent result
    if (stats.results && stats.results.length > 0) {
      const latestResult = stats.results[stats.results.length - 1];
      
      if (latestResult.won) {
        // Try to get the actual game state from localStorage for accurate emoji grid
        const gameStateStr = localStorage.getItem('wordibble-puzzle-state');
        let emojiGrid = `Wordibble #${puzzleNumber} ${latestResult.guesses}/6\nhttps://wordibble.com\n`;
        
        if (gameStateStr) {
          try {
            const gameState = JSON.parse(gameStateStr);
            const attempts = gameState.attempts || [];
            const secretWord = gameState.secretWord || '';
            
            if (attempts.length > 0 && secretWord) {
              // Generate accurate emoji grid from actual game state
              attempts.forEach((attempt: string, attemptIndex: number) => {
                let row = '';
                for (let i = 0; i < attempt.length; i++) {
                  const letter = attempt[i];
                  const secretLetter = secretWord[i];
                  
                  if (letter === secretLetter) {
                    row += '🟩'; // Correct position
                  } else if (secretWord.includes(letter)) {
                    row += '🟨'; // Correct letter, wrong position
                  } else {
                    row += '⬛'; // Letter not in word
                  }
                }
                
                // Add newline for all rows except the last one
                if (attemptIndex < attempts.length - 1) {
                  emojiGrid += row + '\n';
                } else {
                  emojiGrid += row; // No newline for the last row
                }
              });
            } else {
              // Fallback to placeholder if no valid game state
              emojiGrid += generatePlaceholderGrid(latestResult.guesses, latestResult.wordLength);
            }
          } catch (error) {
            console.error('Error parsing game state:', error);
            // Fallback to placeholder
            emojiGrid += generatePlaceholderGrid(latestResult.guesses, latestResult.wordLength);
          }
        } else {
          // Fallback to placeholder if no game state
          emojiGrid += generatePlaceholderGrid(latestResult.guesses, latestResult.wordLength);
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

  // Helper function to generate placeholder grid when actual game state is unavailable
  const generatePlaceholderGrid = (guesses: number, wordLength: number) => {
    let grid = '';
    for (let attempt = 0; attempt < guesses; attempt++) {
      let row = '';
      for (let i = 0; i < wordLength; i++) {
        if (attempt === guesses - 1) {
          // Last row (winning row) - all green
          row += '🟩';
        } else {
          // Previous attempts - mix of colors for visual variety
          row += Math.random() > 0.5 ? '🟨' : '⬛';
        }
      }
      // Add newline for all rows except the last one
      if (attempt < guesses - 1) {
        grid += row + '\n';
      } else {
        grid += row; // No newline for the last row
      }
    }
    return grid;
  };

  const loadPuzzleSnapshot = (puzzle: GameResult) => {
    setSelectedPuzzle(puzzle);
    setShowPuzzleSnapshot(true);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Your Stats</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to game</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Congratulations Message */}
        {stats.wins > 0 && (
          <section className="text-center">
            <div className="text-4xl mb-2">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600">Keep up the great work!</p>
            
            {/* Share Button */}
            <button
              onClick={() => generateAndShareEmojiGrid(stats)}
              className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors border border-blue-500 flex items-center gap-2 mx-auto"
            >
              <Share2 className="w-4 h-4" />
              Share Results
            </button>
          </section>
        )}

        {/* Top numbers */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Played" value={stats.played} />
          <StatCard label="Wins" value={stats.wins} />
          <StatCard label="Win Rate" value={`${winRate(stats)}%`} />
          <StatCard label="Streak" value={`${stats.currentStreak}/${stats.maxStreak}`} />
        </section>

        {/* Guess distribution */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Guess Distribution</h2>
          <div className="space-y-2">
            {stats.guessDistribution.slice(0, 7).map((count, i) => (
              <BarRow key={i} label={`${i + 1}`} count={count} max={Math.max(1, Math.max(...stats.guessDistribution))} />
            ))}
          </div>
        </section>

        {/* Recent games */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Results</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {(() => {
              const dailyResults = (stats.results ?? [])
                .slice()
                .reverse()
                .filter(r => !r.mode?.randomPuzzle); // Only show daily puzzles
              
              if (dailyResults.length === 0) {
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>No daily puzzle results yet.</p>
                    <p className="text-sm mt-2">Complete daily puzzles to see your results here.</p>
                  </div>
                );
              }
              
              return (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <Th>Date</Th>
                      <Th>WL</Th>
                      <Th>Guesses</Th>
                      <Th>Word</Th>
                      <Th>Mode</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailyResults.slice(0, 20).map((r, idx) => (
                      <tr key={idx} className="text-gray-800">
                        <Td>{r.dateISO}</Td>
                        <Td>{r.won ? "Win" : "Loss"}</Td>
                        <Td>{r.guesses}</Td>
                        <Td className="font-mono">
                          <button
                            onClick={() => loadPuzzleSnapshot(r)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title="Click to view puzzle snapshot"
                          >
                            {r.solution ?? "—"}
                          </button>
                        </Td>
                        <Td className="text-xs text-gray-600">
                          {r.mode
                            ? [
                                r.mode.revealClue ? "clue" : "no-clue",
                                r.mode.revealVowels ? `vowels:${r.mode.vowelCount}` : "no-vowels",
                                `L${r.wordLength}`,
                              ].join(" · ")
                            : "—"}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </section>
      </main>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Results copied to clipboard
        </div>
      )}

      {/* Puzzle Snapshot Modal */}
      {showPuzzleSnapshot && selectedPuzzle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Puzzle Snapshot - {selectedPuzzle.dateISO}
              </h2>
              <button
                onClick={() => setShowPuzzleSnapshot(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Puzzle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedPuzzle.wordLength}</div>
                  <div className="text-sm text-gray-600">Letters</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedPuzzle.guesses}</div>
                  <div className="text-sm text-gray-600">Guesses</div>
                </div>
              </div>

              {/* Result */}
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedPuzzle.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedPuzzle.won ? 'Won' : 'Lost'}
                </div>
              </div>

              {/* Solution */}
              {selectedPuzzle.solution && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution</h3>
                  <div className="text-3xl font-mono font-bold text-gray-800 bg-gray-100 px-6 py-3 rounded-lg">
                    {selectedPuzzle.solution}
                  </div>
                </div>
              )}

              {/* Attempt History */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Attempts</h3>
                <div className="space-y-3">
                  {(() => {
                    // Try to get attempts from localStorage for this specific puzzle
                    try {
                      const puzzleState = localStorage.getItem('wordibble-puzzle-state');
                      if (puzzleState) {
                        const state = JSON.parse(puzzleState);
                        // Check if this is the same puzzle (by solution and date)
                        if (state.secretWord === selectedPuzzle.solution && 
                            state.date === selectedPuzzle.dateISO &&
                            state.attempts && state.attempts.length > 0) {
                          return state.attempts.map((attempt: string, index: number) => (
                            <div key={index} className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600">#{index + 1}:</span>
                              <div className="text-lg font-mono font-semibold bg-gray-100 px-4 py-2 rounded-lg">
                                {attempt}
                              </div>
                              {index === state.attempts.length - 1 && state.gameStatus === 'won' && (
                                <span className="text-green-600 text-sm">✓</span>
                              )}
                            </div>
                          ));
                        }
                      }
                      // Fallback: show a generic message
                      return (
                        <div className="text-gray-500 text-sm">
                          <p>Attempt history not available for this puzzle.</p>
                          <p className="mt-1">This usually means the puzzle was completed in a different session.</p>
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div className="text-gray-500 text-sm">
                          <p>Unable to load attempt history.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Game Mode */}
              {selectedPuzzle.mode && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Game Mode</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedPuzzle.mode.revealClue ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPuzzle.mode.revealClue ? 'Clue Enabled' : 'No Clue'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedPuzzle.mode.revealVowels ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPuzzle.mode.revealVowels ? `Vowels: ${selectedPuzzle.mode.vowelCount}` : 'No Vowels'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Note about game grid */}
              <div className="text-center text-gray-600 text-sm">
                <p>Note: Attempt history is shown if available from your current session.</p>
                <p>The visual game grid with letter-by-letter feedback is not stored.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const width = Math.max(6, Math.round((count / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 text-right text-sm text-gray-600">{label}</div>
      <div className="flex-1">
        <div className="h-7 rounded-md bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-green-500 text-white text-xs flex items-center px-2"
            style={{ width: `${width}%` }}
          >
            {count}
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-3 py-2">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className || ''}`}>{children}</td>;
}
