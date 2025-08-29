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

      <div className="space-y-8">
        
        {/* Example 1: Correct Spot */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-green-500 text-white flex items-center justify-center text-xl font-bold rounded border-2 border-green-600">
              A
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              D
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              I
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              E
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              U
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>A</strong> is in the word and in the correct spot.
          </p>
        </div>

        {/* Example 2: Wrong Spot */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              S
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              T
            </div>
            <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center text-xl font-bold rounded border-2 border-amber-600">
              O
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              N
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              Y
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>O</strong> is in the word but in the wrong spot.
          </p>
        </div>

        {/* Example 3: Not in Word */}
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              S
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              N
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              A
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              F
            </div>
            <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded border-2 border-gray-300">
              U
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>Doh!</strong> None of the letters are in the word.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center my-8">How to Play</h2>


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
