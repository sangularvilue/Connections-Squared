'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Game from '../../../components/Game';
import Logo from '../../../components/Logo';
import { decodePuzzle } from '../../../lib/puzzle-codec';

function CustomGameContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get('d');

  if (!data) {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-12 max-w-lg mx-auto">
        <Logo />
        <p className="mt-4 opacity-50">No puzzle data found in URL.</p>
      </div>
    );
  }

  const puzzle = decodePuzzle(data);

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-12 max-w-lg mx-auto">
        <Logo />
        <p className="mt-4 opacity-50">Invalid puzzle link.</p>
      </div>
    );
  }

  return <Game puzzle={puzzle} />;
}

export default function CustomPlayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center min-h-screen px-4 py-12 max-w-lg mx-auto">
        <Logo />
        <p className="mt-4 opacity-50">Loading puzzle...</p>
      </div>
    }>
      <CustomGameContent />
    </Suspense>
  );
}
