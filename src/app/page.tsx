'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { getAllPuzzlesAsync, getUnpublishedPuzzlesAsync } from '../lib/puzzles';
import { Puzzle } from '../types';

export default function HomePage() {
  const [tab, setTab] = useState<'official' | 'custom'>('official');
  const [officialPuzzles, setOfficialPuzzles] = useState<Puzzle[]>([]);
  const [customPuzzles, setCustomPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllPuzzlesAsync(),
      getUnpublishedPuzzlesAsync(),
    ]).then(([published, unpublished]) => {
      setOfficialPuzzles(published.filter(p => !(p as any).is_custom));
      const community = [
        ...published.filter(p => (p as any).is_custom),
        ...unpublished,
      ];
      setCustomPuzzles(community);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 max-w-lg mx-auto">
      <Logo />
      <p className="text-sm mt-2 mb-4 opacity-60 text-center">
        Find groups of words — in two dimensions
      </p>

      {/* Tabs */}
      <div className="flex gap-0 w-full mb-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <button
          onClick={() => setTab('official')}
          className="flex-1 py-2 text-sm font-semibold cursor-pointer border-0"
          style={{
            backgroundColor: tab === 'official' ? 'var(--foreground)' : 'transparent',
            color: tab === 'official' ? 'var(--background)' : 'var(--foreground)',
          }}
        >
          Official
        </button>
        <button
          onClick={() => setTab('custom')}
          className="flex-1 py-2 text-sm font-semibold cursor-pointer border-0"
          style={{
            backgroundColor: tab === 'custom' ? 'var(--foreground)' : 'transparent',
            color: tab === 'custom' ? 'var(--background)' : 'var(--foreground)',
          }}
        >
          Community
        </button>
      </div>

      {loading ? (
        <p className="opacity-40 py-8">Loading...</p>
      ) : tab === 'official' ? (
        <PuzzleList puzzles={officialPuzzles} emptyMessage="No official puzzles yet." />
      ) : (
        <>
          <Link
            href="/create"
            className="w-full rounded-xl p-4 text-center font-semibold text-sm no-underline mb-3 block"
            style={{
              backgroundColor: 'var(--foreground)',
              color: 'var(--background)',
            }}
          >
            + Create Your Own
          </Link>
          <PuzzleList puzzles={customPuzzles} emptyMessage="No community puzzles yet. Be the first!" />
        </>
      )}
    </div>
  );
}

function PuzzleList({ puzzles, emptyMessage }: { puzzles: Puzzle[]; emptyMessage: string }) {
  if (puzzles.length === 0) {
    return <div className="text-center py-8 opacity-50">{emptyMessage}</div>;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {puzzles.map((puzzle) => {
        const dateStr = new Date(puzzle.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        return (
          <Link
            key={puzzle.id}
            href={`/play/${puzzle.id}`}
            className="block rounded-xl p-4 transition-all hover:scale-[1.01] no-underline"
            style={{ backgroundColor: 'var(--tile-bg)', color: 'var(--foreground)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-base">
                  {puzzle.title || `Puzzle ${puzzle.id}`}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {dateStr}
                  {(puzzle as any).creator_name && ` · by ${(puzzle as any).creator_name}`}
                </div>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={`r${i}`} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `var(--row-${i})` }} />
                ))}
                {[0, 1, 2, 3].map(i => (
                  <div key={`c${i}`} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `var(--col-${i})` }} />
                ))}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
