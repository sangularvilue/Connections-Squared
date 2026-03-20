'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { getPublishedPuzzles, getCommunityPuzzles } from '../lib/puzzles';
import { Puzzle } from '../types';

export default function HomePage() {
  const [published, setPublished] = useState<Puzzle[]>([]);
  const [community, setCommunity] = useState<Puzzle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPublished(getPublishedPuzzles());
    setCommunity(getCommunityPuzzles());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen opacity-40">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 max-w-lg mx-auto">
      <Logo />
      <p className="text-sm mt-2 mb-8 opacity-60 text-center">
        Find groups of four — in two dimensions
      </p>

      {/* Official puzzles */}
      {published.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          {published.map(puzzle => (
            <PuzzleCard key={puzzle.id} puzzle={puzzle} />
          ))}
        </div>
      )}

      {published.length === 0 && community.length === 0 && (
        <div className="text-center py-12 opacity-50">
          No puzzles yet. Check back soon!
        </div>
      )}

      {/* Community puzzles */}
      {community.length > 0 && (
        <>
          <div className="w-full mt-8 mb-3">
            <h2 className="text-sm font-semibold opacity-50 uppercase tracking-wide">Community</h2>
          </div>
          <div className="w-full flex flex-col gap-3">
            {community.map(puzzle => (
              <PuzzleCard key={puzzle.id} puzzle={puzzle} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  const dateStr = new Date(puzzle.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/play/${puzzle.id}`}
      className="block rounded-xl p-4 transition-all hover:scale-[1.01] no-underline"
      style={{
        backgroundColor: 'var(--tile-bg)',
        color: 'var(--foreground)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-base">
            {puzzle.title || `Puzzle ${puzzle.id}`}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {dateStr}
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: puzzle.size ?? 4 }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: `var(--cat-${i})` }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
