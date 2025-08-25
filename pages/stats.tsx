import React from "react";
import Link from "next/link";
import { loadStats, winRate } from "../lib/stats";

export default function StatsPage() {
  const stats = loadStats();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Your Stats</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to game</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Top numbers */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Played" value={stats.played} />
          <StatCard label="Wins" value={stats.wins} />
          <StatCard label="Win Rate" value={`${winRate(stats)}%`} />
          <StatCard label="Streak" value={`${stats.currentStreak}/${stats.maxStreak}`} />
        </section>

        {/* Guess distribution */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Guess Distribution</h2>
          <div className="space-y-2">
            {stats.guessDistribution.slice(0, 7).map((count, i) => (
              <BarRow key={i} label={`${i + 1}`} count={count} max={Math.max(1, Math.max(...stats.guessDistribution))} />
            ))}
          </div>
        </section>

        {/* Recent games */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Results</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <Th>Date</Th>
                  <Th>WL</Th>
                  <Th>Guesses</Th>
                  <Th>Word</Th>
                  <Th>Mode</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats.results ?? [])
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((r, idx) => (
                    <tr key={idx} className="text-gray-800">
                      <Td>{r.dateISO}</Td>
                      <Td>{r.won ? "Win" : "Loss"}</Td>
                      <Td>{r.guesses}</Td>
                      <Td className="font-mono">{r.solution ?? "—"}</Td>
                      <Td className="text-xs text-gray-600">
                        {r.mode
                          ? [
                              r.mode.revealClue ? "clue" : "no-clue",
                              r.mode.revealVowels ? `vowels:${r.mode.vowelCount}` : "no-vowels",
                              `L${r.wordLength}`,
                            ].join(" · ")
                          : "—"}
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const width = Math.max(6, Math.round((count / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 text-right text-sm text-gray-600">{label}</div>
      <div className="flex-1">
        <div className="h-7 rounded-md bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-green-500 text-white text-xs flex items-center px-2"
            style={{ width: `${width}%` }}
          >
            {count}
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-3 py-2">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className || ''}`}>{children}</td>;
}
