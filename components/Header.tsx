import React from 'react';
import { BarChart3, Settings, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Props {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
      {/* <Bot className="w-6 h-6 text-green-600" /> */}
        <h1 className="logo text-xl font-bold text-gray-900">        
        Word
        <span>i</span>
        bble
        </h1>
        <div className="flex items-center gap-2">
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
