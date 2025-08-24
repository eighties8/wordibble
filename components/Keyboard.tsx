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
    if (key === 'ENTER' || key === 'BACKSPACE') return 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700 !text-white';
    
    const state = letterStates[key];
    switch (state) {
      case 'correct':
        return 'bg-green-500 hover:bg-green-600 active:bg-green-700 !text-white';
      case 'present':
        return 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 !text-white';
      case 'absent':
        return 'bg-gray-300 hover:bg-gray-400 active:bg-gray-500 !text-gray-400';
      default:
        return 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700 !text-white';
    }
  };

  const getKeyClasses = (key: string) => {
    const baseClasses = [
      'px-1.5 py-4 md:px-3 md:py-4 rounded font-semibold text-white transition-colors touch-manipulation',
      'text-center',
      key === 'ENTER' || key === 'BACKSPACE' ? 'text-sm md:text-sm' : 'text-base md:text-lg',
      getKeyColor(key)
    ];
    
    if (key === 'ENTER') {
      baseClasses.push('flex-1 min-w-0'); // Make ENTER key fill remaining space
    } else if (key === 'BACKSPACE') {
      baseClasses.push('min-w-[64px] md:min-w-[96px]'); // Narrower but still wide for backspace
    } else {
      baseClasses.push('min-w-[32px] md:min-w-[48px]'); // Narrower mobile width for letter keys
    }
    
    return baseClasses.join(' ');
  };

  const getKeyContent = (key: string) => {
    if (key === 'BACKSPACE') return '⌫';
    if (key === 'ENTER') return 'ENTER';
    
    const state = letterStates[key];
    if (state === 'absent') {
      return <span className="line-through-custom">{key}</span>;
    }
    return key;
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
    <div className="mt-4 md:mt-8 space-y-2 md:space-y-2 select-none">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5 md:gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              onTouchStart={() => {}} // Ensure touch events work
              className={getKeyClasses(key)}
            >
              {getKeyContent(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
