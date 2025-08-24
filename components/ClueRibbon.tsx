import React from 'react';

interface Props {
  clue: string;
  targetWord?: string;
}

export default function ClueRibbon({ clue, targetWord }: Props) {
  return (
    <div className="flex items-center justify-center mb-6">
      {/* Information/Clue Icon */}
      <div className="w-8 h-8 mr-1 bg-gray-100 rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      
      {/* Speech Bubble */}
      <div className="bg-amber-500 text-white px-4 py-2 rounded-lg relative shadow-md">
        <div className="text-sm font-medium">
          {clue}
          {targetWord && (
            <span className="ml-2 opacity-90">
              • {targetWord}
            </span>
          )}
        </div>
        {/* Speech bubble tail pointing from icon to bubble */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-amber-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  );
}
