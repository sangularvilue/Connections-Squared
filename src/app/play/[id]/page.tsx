import { notFound } from 'next/navigation';
import Game from '../../../components/Game';
import { getPuzzle, getAllPuzzles } from '../../../lib/puzzles';

export function generateStaticParams() {
  return getAllPuzzles().map(p => ({ id: p.id }));
}

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const puzzle = getPuzzle(id);
  if (!puzzle) notFound();
  return <Game puzzle={puzzle} />;
}
