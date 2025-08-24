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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Game />
      </main>
    </>
  );
}
