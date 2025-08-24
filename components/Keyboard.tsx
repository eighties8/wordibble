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
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getKeyColor = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'bg-gray-600 hover:bg-gray-500';
    
    const state = letterStates[key];
    switch (state) {
      case 'correct':
        return 'bg-green-500 hover:bg-green-600';
      case 'present':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'absent':
        return 'bg-gray-700 hover:bg-gray-600';
      default:
        return 'bg-gray-600 hover:bg-gray-500';
    }
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
    <div className="mt-8 space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={[
                'px-3 py-4 rounded font-semibold text-white transition-colors',
                key === 'ENTER' || key === 'BACKSPACE' ? 'text-sm' : 'text-lg',
                getKeyColor(key)
              ].join(' ')}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
