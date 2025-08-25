import React from 'react';
import { AArrowDown, Bot, BotOff } from 'lucide-react';

interface Props {
  clue: string;
  targetWord?: string;
  onRevealLetter?: () => void;
  letterRevealsRemaining?: number;
  onSettingsClick?: () => void;
}

export default function ClueRibbon({ clue, targetWord, onRevealLetter, letterRevealsRemaining, onSettingsClick }: Props) {
  return (
    <div className="flex items-center justify-center mb-6">
      {/* Information/Clue Icon */}
      <div className="w-8 h-8 mr-1 bg-gray-100 rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      
      {/* Speech Bubble */}
      <div className="clue-ribbon bg-amber-500 text-white pl-4 rounded-lg relative shadow-md">
        <div className="text-sm font-medium flex items-center justify-between gap-2">
          <span>
            {clue ? (
              clue
            ) : (
              <button 
                onClick={onSettingsClick}
                className="hover:underline cursor-pointer"
                type="button"
              >
                Need a clue? Click here
              </button>
            )}
            {targetWord && (
              <span className="ml-2 opacity-90">
                • {targetWord}
              </span>
            )}
          </span>
          
                {/* Bot reveal button */}
                 {onRevealLetter && (
                   <button
                     onClick={onRevealLetter}
                     className="clue-bot bg-gray-300 shadow-[inset_4px_0_6px_-2px_rgba(0,0,0,0.2)] flex-shrink-0 p-1 hover:bg-amber-600 transition-colors duration-200 group relative"
                     title={letterRevealsRemaining && letterRevealsRemaining > 0 ? "Need help? Click here to reveal one letter" : "No more reveals available"}
                     disabled={!letterRevealsRemaining || letterRevealsRemaining <= 0}
                   >
                     {letterRevealsRemaining && letterRevealsRemaining > 0 ? (
                       <AArrowDown className="w-6 h-6 !text-gray-800" />
                     ) : (
                       <AArrowDown className="w-6 h-6 !text-gray-800 opacity-50" />
                     )}

                     {/* Tooltip */}
                     <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                       {letterRevealsRemaining && letterRevealsRemaining > 0 ? "Need help? Click here to reveal one letter" : "No more reveals available"}
                       <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                     </div>
                   </button>
                 )}
        </div>
        {/* Speech bubble tail pointing from icon to bubble */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-amber-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  );
}
