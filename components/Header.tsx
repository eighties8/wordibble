import React from 'react';
import { BarChart3, Settings, Calendar, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  onSettingsClick: () => void;
  onShareClick?: () => void;
}

export default function Header({ onSettingsClick, onShareClick }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
      {/* <Bot className="w-6 h-6 text-green-600" /> */}
        <Link href="/" className="no-underline focus:outline-none">
          <h1 className="logo text-xl italic font-bold text-gray-900 cursor-pointer">        
          Wor
          <span>dibble</span>
          </h1>
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
