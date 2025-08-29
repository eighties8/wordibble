import React from 'react';
import { BarChart3, Settings, Calendar, Share2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  onSettingsClick: () => void;
  onShareClick?: () => void;
}

export default function Header({ onSettingsClick, onShareClick }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between px-4">
        <Link 
          href="/" 
          className="no-underline focus:outline-none flex items-center gap-2"
        >
          <div className="logo grid grid-cols-2 gap-[2px] p-[2px] w-6 h-6 border border-gray-900 rounded-sm">
            <div className="bg-green-500"></div>
            <div className="bg-amber-500"></div>
            <div className="bg-green-500"></div>
            <div className="bg-green-500"></div>
          </div>
          <h1 className="text-xl font-medium text-gray-600">Wordibble</h1>
        </Link>
        <div className="flex items-center gap-2">
          {onShareClick && (
            <button
              onClick={onShareClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share Results"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          <Link
            href="/stats"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Stats"
          >
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link
            href="/archive"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Archive"
          >
            <Calendar className="w-5 h-5" />
          </Link>
          <Link
            href="/how-to-play"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="How to Play"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
