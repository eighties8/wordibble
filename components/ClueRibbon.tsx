import { AArrowDown, PartyPopper, Settings, Trophy } from "lucide-react";

interface Props {
  clue: string;
  targetWord?: string;
  onRevealLetter?: () => void;
  letterRevealsRemaining?: number;
  onSettingsClick?: () => void;
  variant?: 'clue' | 'error' | 'success' | 'solution'; // Add this line
}

export default function ClueRibbon({ clue, targetWord, onRevealLetter, letterRevealsRemaining, onSettingsClick, variant = 'clue' }: Props) {
  console.log('ClueRibbon variant:', variant, 'clue:', clue);
  return (
    <div className="flex items-center justify-center mb-6">
      {/* Information/Clue Icon */}
      <div className="w-8 h-8 mr-1 bg-gray-100 rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      
      {/* Speech Bubble - Maintain consistent green background for all variants */}
      {/* <div className={`clue-ribbon relative shadow-md rounded-lg pl-4 bg-green-500 text-white`}> */}
      <div className={`clue-ribbon relative shadow-md rounded-lg pl-3 transition-all duration-500 ease-in-out ${
          variant === 'error' ? 'bg-red-500' : variant === 'success' ? 'bg-green-500' : 'bg-gray-500'
        } text-white`}>
        <div className="text-sm flex items-center justify-between gap-2">
          <span className="transition-all duration-500 ease-in-out flex items-center gap-2 pl-1 pr-2">
            {clue ? (
              <>
                {clue.startsWith('Win! Nice. Wordibble #') && <PartyPopper className="w-5 h-5 text-white animate-pulse" />}
                <span className={`transition-all duration-500 ease-in-out ${
                  clue.startsWith('Win! Nice. Wordibble #') ? 'animate-fade-in' : ''
                }`}>{clue}</span>
              </>
            ) : (
              <button 
                onClick={onSettingsClick}
                className="hover:underline cursor-pointer"
                type="button"
              >
                Enable clues & vowels? <Settings className="w-4 h-4 inline-block align-middle"/>
              </button>
            )}
            {targetWord && (
              <span className="ml-2 opacity-90">
                • {targetWord}
              </span>
            )}
          </span>
          
          {/* Bot reveal button - Show for all variants to maintain consistent structure */}
          {onRevealLetter && (
            <button
              onClick={onRevealLetter}
              className="clue-letter bg-gray-300 shadow-[inset_4px_0_6px_-2px_rgba(0,0,0,0.2)] flex-shrink-0 p-1 hover:bg-green-600 transition-colors duration-200 group relative"
              title={letterRevealsRemaining && letterRevealsRemaining > 0 ? "Need help? Click here to reveal one letter" : "No more reveals available"}
              disabled={!letterRevealsRemaining || letterRevealsRemaining <= 0}
            >
              {letterRevealsRemaining && letterRevealsRemaining > 0 ? (
                <AArrowDown className="w-5 h-5 !text-gray-800" />
              ) : (
                <AArrowDown className="w-5 h-5 !text-gray-800 opacity-50" />
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50">
                {letterRevealsRemaining && letterRevealsRemaining > 0 ? "Need help? Click here to reveal one letter" : "No more reveals available"}
                <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </button>
          )}
        </div>
        
        {/* Speech bubble tail - Change color based on variant */}
        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-t-4 border-t-transparent border-b-4 border-b-transparent transition-all duration-500 ease-in-out ${
          variant === 'error' ? '!border-r-red-500' : variant === 'success' ? '!border-r-green-500' : '!border-r-gray-500'
        }`} 
        style={{
          borderRightColor: variant === 'error' ? '#ef4444' : variant === 'success' ? '#22c55e' : '#6b7280'
        }}
        ></div>
      </div>
    </div>
  );
}