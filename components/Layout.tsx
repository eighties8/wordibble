import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart3, CalendarDays, Settings, HelpCircle, Eye, Sparkles, Cross, BookOpenText } from "lucide-react";
import React, { useEffect, useState } from "react";
import SettingsModal from "./Settings";
import HowToPlayContent from "./HowToPlayContent";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;               // optional page title shown in header
  narrow?: boolean;             // use a narrower content width on some pages
  onSettingsChange?: (settings: any) => void;  // callback for settings changes
  currentSettings?: any;        // current settings to pass to Settings modal
  debugMode?: boolean;          // debug mode flag
  onOpenSettings?: (openedFromClue: boolean, puzzleInProgress?: boolean) => void; // Callback to open settings from children
  showScriptureLink?: boolean;  // show scripture link in header
  scriptureWord?: string;       // word to link to scripture page
  scripturePuzzleNumber?: string; // puzzle number for scripture page
};

export default function Layout({ children, title, narrow, onSettingsChange, currentSettings, debugMode = false, onOpenSettings, showScriptureLink = false, scriptureWord }: LayoutProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openedFromClue, setOpenedFromClue] = useState(false);
  const [puzzleInProgress, setPuzzleInProgress] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    setOpenedFromClue(false);
    
    // Check if there's a currently active puzzle by looking at localStorage
    try {
      const puzzles = localStorage.getItem('wordibble:puzzles:v2');
      if (puzzles) {
        const puzzlesData = JSON.parse(puzzles);
        // Check if the current puzzle (most recent one) is in progress
        const puzzleIds = Object.keys(puzzlesData).sort().reverse();
        if (puzzleIds.length > 0) {
          const currentPuzzleId = puzzleIds[0]; // Most recent puzzle
          const currentPuzzle = puzzlesData[currentPuzzleId];
          // Only consider it an active puzzle if it's actually being played, not just started
          const hasActivePuzzle = currentPuzzle.gameStatus === 'playing';
          setPuzzleInProgress(hasActivePuzzle);
        } else {
          setPuzzleInProgress(false);
        }
      } else {
        setPuzzleInProgress(false);
      }
    } catch (error) {
      setPuzzleInProgress(false);
    }
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsChange = (newSettings: any) => {
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
    // Don't auto-close the modal - let user close it manually
    // setIsSettingsOpen(false);
  };

  // Function to open settings from children components
  const openSettings = (openedFromClue: boolean = false, puzzleInProgress: boolean = false) => {
    setIsSettingsOpen(true);
    setOpenedFromClue(openedFromClue);
    setPuzzleInProgress(puzzleInProgress);
    // Store the source for the SettingsModal
    if (onOpenSettings) {
      onOpenSettings(openedFromClue, puzzleInProgress);
    }
  };

  // Function to reset settings to defaults
  const resetSettings = () => {
    // Reset to factory defaults
    const defaultSettings = {
      wordLength: 5,
      maxGuesses: 3,
      hideClue: false,
      randomPuzzle: false,
      lockGreenMatchedLetters: false,
    };
    
    // Update parent settings
    if (onSettingsChange) {
      onSettingsChange(defaultSettings);
    }
  };

  // Clone children and pass the openSettings and resetSettings functions
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { openSettings, resetSettings } as any);
    }
    return child;
  });

  // First-run detection (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const puzzles = localStorage.getItem('wordibble:puzzles:v2');
      const dismissed = localStorage.getItem('wordibble:firstRunDismissed');
      if (!puzzles && dismissed !== 'true') {
        setShowFirstRun(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissFirstRun = () => {
    setShowFirstRun(false);
    try { localStorage.setItem('wordibble:firstRunDismissed', 'true'); } catch {}
  };

  return (
    <div className="background min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="no-underline focus:outline-none flex items-center gap-2"
          >
            {/* Logo container */}
            <div className="flex items-center justify-center w-8 h-8">
              {/* <svg
                viewBox="0 0 256 256"
                className="block w-full h-full"           // <- fill the 40×40 wrapper
                aria-hidden="true"
                focusable="false"
                preserveAspectRatio="xMidYMid meet"
              >
                <rect x="16" y="16" width="224" height="224" rx="40" fill="#16a34a" />
                <path d="M32 128c36-54 88-82 96-82s60 28 96 82c-36 54-88 82-96 82s-60-28-96-82Z" fill="#F8FAFC" />
                <circle cx="128" cy="128" r="36" fill="#16a34a" />
                <circle cx="128" cy="128" r="14" fill="#0B4D2A" />
              </svg> */}
              <img src="/logo-alt5.webp" alt="Wordibble" className="w-8 h-8" />
            </div>

            {/* Title */}
            <h1 className="header-title text-xl hidden sm:block">
              Wordibble
              {title ? <span className="text-gray-400"> · {title}</span> : null}
            </h1>
          </Link>

          {/* Header actions (keep same across pages) */}
          <div className="flex items-center gap-4 text-gray-600">
            <button
              aria-label="How to Play"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => router.push("/how-to-play")}
              title="How to Play"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {showScriptureLink && scriptureWord && (
              <button
                aria-label="Scripture"
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => router.push(`/stats`)}
                title="View scripture definitions and verse references"
              >
                <BookOpenText className="w-5 h-5" />
              </button>
            )}
            {/* Debug: Manual scripture link trigger */}
            {debugMode && (
              <button
                aria-label="Debug Scripture Link"
                className="p-2 rounded hover:bg-gray-100 text-xs"
                onClick={() => {
                  // Trigger a manual check by refreshing the page
                  window.location.reload();
                }}
                title="Debug: Trigger scripture link check"
              >
                🔧
              </button>
            )}
            <button
              aria-label="Stats"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => router.push("/stats")}
              title="Stats"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              aria-label="Archive"
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => router.push("/archive")}
              title="Archive"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button
              aria-label="Settings"
              className="p-2 rounded hover:bg-gray-100"
              onClick={handleSettingsClick}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content wrapper - identical on every page */}
      <main className={`flex-1 ${title === undefined ? "flex items-center justify-center" : ""}`}>
        <div
          className={[
            "mx-auto  w-full",
            // game wants a bit wider than stats/archive; toggle with `narrow`
            narrow ? "max-w-3xl" : "md:max-w-4xl",
          ].join(" ")}
        >
          {childrenWithProps}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <div className="mb-2">
            VerseWord - Deepen your Bible knowledge with daily word puzzles and insights
          </div>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/about" className="hover:text-gray-700">About</Link>
            <Link href="/rules" className="hover:text-gray-700">Rules</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
          </nav>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && currentSettings && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          onSettingsChange={handleSettingsChange}
          currentSettings={currentSettings}
          debugMode={debugMode}
          openedFromClue={openedFromClue}
          puzzleInProgress={puzzleInProgress}
        />
      )}

      {/* First-run HowTo modal */}
      {showFirstRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 relative">
            <button
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={dismissFirstRun}
            >
              ✕
            </button>
            <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6">
              <HowToPlayContent compact />
              <div className="mt-6 flex justify-center">
                <button
                  onClick={dismissFirstRun}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors"
                >
                  Got it! Take me to the Puzzle!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
