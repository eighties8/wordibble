import React from 'react';

interface Props {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStates: Record<string, 'correct' | 'present' | 'absent'>;
}

export default function Keyboard({ onKeyPress, onEnter, onBackspace, letterStates }: Props) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACKSPACE'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
  ];

  const getKeyColor = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700';
    
    const state = letterStates[key];
    switch (state) {
      case 'correct':
        return 'bg-green-500 hover:bg-green-600 active:bg-green-700';
      case 'present':
        return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700';
      case 'absent':
        return 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800';
      default:
        return 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700';
    }
  };

  const getKeyClasses = (key: string) => {
    const baseClasses = [
      'px-1.5 py-2 md:px-3 md:py-4 rounded font-semibold text-white transition-colors touch-manipulation',
      'text-center',
      key === 'ENTER' || key === 'BACKSPACE' ? 'text-xs md:text-sm' : 'text-sm md:text-lg',
      getKeyColor(key)
    ];
    
    if (key === 'ENTER') {
      baseClasses.push('flex-1 min-w-0'); // Make ENTER key fill remaining space
    } else {
      baseClasses.push('min-w-[32px] md:min-w-[48px]'); // Fixed width for other keys
    }
    
    return baseClasses.join(' ');
  };

  const handleKeyClick = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="mt-4 md:mt-8 space-y-1 md:space-y-2 select-none">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5 md:gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              onTouchStart={() => {}} // Ensure touch events work
              className={getKeyClasses(key)}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
