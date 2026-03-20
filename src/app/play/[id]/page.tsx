'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Game from '../../../components/Game';
import { getPuzzle } from '../../../lib/puzzles';
import { Puzzle } from '../../../types';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const p = getPuzzle(id);
    if (p) {
      setPuzzle(p);
    } else {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Puzzle not found</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm opacity-60 underline cursor-pointer border-0 bg-transparent"
            style={{ color: 'var(--foreground)' }}
          >
            Back to puzzles
          </button>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen opacity-40">Loading...</div>
    );
  }

  return <Game puzzle={puzzle} />;
}
