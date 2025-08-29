import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart3, CalendarDays, Settings, HelpCircle } from "lucide-react";
import React, { useState } from "react";
import SettingsModal from "./Settings";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;               // optional page title shown in header
  narrow?: boolean;             // use a narrower content width on some pages
  onSettingsChange?: (settings: any) => void;  // callback for settings changes
  currentSettings?: any;        // current settings to pass to Settings modal
  debugMode?: boolean;          // debug mode flag
  onOpenSettings?: (openedFromClue: boolean) => void; // Callback to open settings from children
};

export default function Layout({ children, title, narrow, onSettingsChange, currentSettings, debugMode = false, onOpenSettings }: LayoutProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openedFromClue, setOpenedFromClue] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    setOpenedFromClue(false);
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
  const openSettings = (openedFromClue: boolean = false) => {
    setIsSettingsOpen(true);
    setOpenedFromClue(openedFromClue);
    // Store the source for the SettingsModal
    if (onOpenSettings) {
      onOpenSettings(openedFromClue);
    }
  };

  // Function to reset settings to defaults
  const resetSettings = () => {
    // Reset to factory defaults
    const defaultSettings = {
      wordLength: 5,
      maxGuesses: 6,
      revealClue: false,
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

  return (
    <div className="background min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="no-underline focus:outline-none flex items-center gap-2"
          >
            {/* logo tile */}
            <div className="grid grid-cols-2 gap-[2px] p-[2px] w-6 h-6 border border-gray-900 rounded-sm">
              <div className="bg-green-500" />
              <div className="bg-amber-500" />
              <div className="bg-green-500" />
              <div className="bg-green-500" />
            </div>
            <h1 className="text-xl font-medium text-gray-700">
              Wordibble{title ? <span className="text-gray-400"> · {title}</span> : null}
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

      {/* Main content wrapper – identical on every page */}
      <main className="flex-1">
        <div
          className={[
            "mx-auto",
            // game wants a bit wider than stats/archive; toggle with `narrow`
            narrow ? "max-w-3xl" : "max-w-4xl",
          ].join(" ")}
        >
          {childrenWithProps}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          Wordibble – Crack the daily word with clever clues, vowel vibes, or pure brain dazzle!
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
        />
      )}
    </div>
  );
}
