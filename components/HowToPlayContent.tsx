import React from "react";
import Link from "next/link";

interface HowToPlayContentProps {
  compact?: boolean;
}

export default function HowToPlayContent({ compact = false }: HowToPlayContentProps) {
  return (
    <div className={compact ? "max-w-2xl mx-auto" : "max-w-2xl mx-auto px-4 py-8"}>
      <h1 className="text-3xl text-center mb-8">Guess the Word in 3 tries</h1>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-green-600 text-white">
                S
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                O
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                A
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                R
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                E
              </div>
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>S</strong> is in the word and in the correct spot.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                C
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                L
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-yellow-500 text-white">
                I
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                N
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                T
              </div>
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>I</strong> is in the word but in the wrong spot.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                W
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                R
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                O
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                N
              </div>
            </div>
            <div className="tile-frame w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg transform-gpu">
              <div className="tile-panel flex items-center justify-center text-center uppercase text-lg md:text-lg lg:text-xl transform-gpu origin-center preserve-3d bg-gray-200 text-gray-900">
                G
              </div>
            </div>
          </div>
          <p className="text-center text-gray-700">
            <strong>Doh!</strong> None of the letters are in the word.
          </p>
        </div>
      </div>

      <h2 className="text-3xl text-center my-8">How to Play</h2>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <ul className="list-disc list-outside space-y-2 text-gray-700">
            <li>Each guess must be a valid word with the selected length (5, 6, or 7 letters).</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
            <li>Want more challenge? Use the personalized settings to enable hard mode & disable clues.</li>
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


