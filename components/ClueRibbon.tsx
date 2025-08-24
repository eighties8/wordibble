import React from 'react';

interface Props {
  clue: string;
}

export default function ClueRibbon({ clue }: Props) {
  return (
    <div className="bg-blue-900 border border-blue-600 rounded-full px-4 py-2 mb-4">
      <span className="text-blue-200 text-sm font-medium">
        💡 {clue}
      </span>
    </div>
  );
}
