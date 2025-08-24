import React from 'react';
import Head from 'next/head';
import Game from '../components/Game';

export default function Home() {
  return (
    <>
      <Head>
        <title>Wordibble - Refined Word Search Puzzle</title>
        <meta name="description" content="A refined Wordle-style game with better UX and switchable 5, 6, or 7 letter modes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        
        {/* Favicon configuration */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=2" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <main>
        <Game />
      </main>
    </>
  );
}
