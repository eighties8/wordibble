import React, { useState, useEffect } from 'react';

interface SettingsConfig {
  wordLength: 5 | 6 | 7;
  maxGuesses: number;
  revealVowels: boolean;
  revealVowelCount: number;
  revealClue: boolean;
  randomPuzzle: boolean;
  lockGreenMatchedLetters: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: SettingsConfig) => void;
  currentSettings: SettingsConfig;
  debugMode: boolean;
  openedFromClue?: boolean;
}

export default function Settings({ isOpen, onClose, onSettingsChange, currentSettings, debugMode, openedFromClue = false }: Props) {
  const [settings, setSettings] = useState<SettingsConfig>({
    ...currentSettings,
    randomPuzzle: currentSettings.randomPuzzle ?? false,
    // Auto-enable Show Clue if opened from clue link
    revealClue: openedFromClue ? true : currentSettings.revealClue,
    lockGreenMatchedLetters: currentSettings.lockGreenMatchedLetters ?? true,
  });

  useEffect(() => {
    if (isOpen) {
      // Ensure all required properties exist with defaults
      // Use current puzzle's word length, fallback to stored settings, then default to 6
      const currentWordLength = currentSettings.wordLength || 6;
      
      const settingsWithDefaults: SettingsConfig = {
        wordLength: currentWordLength,
        maxGuesses: currentSettings.maxGuesses,
        revealVowels: currentSettings.revealVowels,
        revealVowelCount: currentSettings.revealVowelCount,
        revealClue: openedFromClue ? true : currentSettings.revealClue,
        randomPuzzle: currentSettings.randomPuzzle ?? false,
        lockGreenMatchedLetters: currentSettings.lockGreenMatchedLetters ?? true,
      };
      
      setSettings(settingsWithDefaults);
    }
  }, [isOpen, currentSettings, openedFromClue]);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('wordibble-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(currentSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Word Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Word Length
            </label>
            <div className="flex space-x-4">
              {([5, 6, 7] as const).map((length) => (
                <label key={length} className="flex items-center">
                  <input
                    type="radio"
                    name="wordLength"
                    value={length}
                    checked={settings.wordLength === length}
                    onChange={(e) => setSettings(prev => ({ ...prev, wordLength: Number(e.target.value) as 5 | 6 | 7 }))}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{length} letters</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Guesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Max Guesses
            </label>
            <input
              type="number"
              min="4"
              max="8"
              value={settings.maxGuesses}
              onChange={(e) => setSettings(prev => ({ ...prev, maxGuesses: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Reveal Vowels Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reveal Vowels
              </label>
              <p className="text-xs text-gray-500">Show vowel positions at the start</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, revealVowels: !prev.revealVowels }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.revealVowels ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.revealVowels ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Vowel Count (only if revealVowels is true) */}
          {settings.revealVowels && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Number of Vowels to Reveal
              </label>
              <input
                type="number"
                min="1"
                max="3"
                value={settings.revealVowelCount}
                onChange={(e) => {
                  const value = Math.min(3, Math.max(1, Number(e.target.value)));
                  setSettings(prev => ({ ...prev, revealVowelCount: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 1-3</p>
            </div>
          )}

          {/* Reveal Clue Toggle */}
          <div className={`flex items-center justify-between ${openedFromClue ? 'rounded bg-green-500 p-4 text-white' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-1">
                Show Clue (Current: {settings.revealClue ? 'ON' : 'OFF'})
              </label>
              <p className="text-xs opacity-90">Display a hint for each puzzle</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, revealClue: !prev.revealClue }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.revealClue ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.revealClue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Random Puzzle Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Random Puzzle
              </label>
              <p className="text-xs text-gray-500">New puzzle on each page load</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, randomPuzzle: !prev.randomPuzzle }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.randomPuzzle ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.randomPuzzle ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Lock Green Matched Letters Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disable Green Letter Locking
              </label>
              <p className="text-xs text-gray-500">Disable automatic locking of exact matched letters in input row</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, lockGreenMatchedLetters: !prev.lockGreenMatchedLetters }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !settings.lockGreenMatchedLetters ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  !settings.lockGreenMatchedLetters ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
