import React from "react";
import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Guess the Wordibble in 6 tries</h1>
      
      {/* <div className="text-center mb-8">
        <p className="text-lg text-gray-700">
          Guess the Wordibble in 6 tries.
        </p>
      </div> */}

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Each guess must be a valid word with the selected length (5, 6, or 7 letters).</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
            <li>Stuck? You can use a lifeline to reveal a letter on the first guess.</li>
            <li>Options? Use the personalized settings to choose the word length and enable word clues, & more.</li>
            <li>Play past puzzles from the <Link href="/archive" className="text-blue-600 underline hover:text-blue-800">archive</Link>.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-900">Examples</h2>
        
        {/* Example 1: Correct Spot */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-green-500 text-white flex items-center justify-center text-xl font-bold rounded border-2 border-green-600">
              W
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              O
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              R
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              D
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              Y
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>W</strong> is in the word and in the correct spot.
          </p>
        </div>

        {/* Example 2: Wrong Spot */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              L
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              I
            </div>
            <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center text-xl font-bold rounded border-2 border-amber-600">
              G
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              H
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              T
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>G</strong> is in the word but in the wrong spot.
          </p>
        </div>

        {/* Example 3: Not in Word */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              R
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              O
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              G
            </div>
            <div className="w-12 h-12 bg-gray-400 text-gray-600 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-500">
              U
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              E
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>U</strong> is not in the word in any spot.
          </p>
        </div>
      </div>

      <div className="text-center text-gray-600 mt-12">
        <p>
          A new puzzle is released daily at midnight. If you haven&apos;t already, you can{" "}
          <Link href="/" className="text-blue-600 underline hover:text-blue-800">
            play today&apos;s puzzle
          </Link>.
        </p>
      </div>
    </div>
  );
}

HowToPlayPage.title = "How to Play";
HowToPlayPage.narrow = true;
