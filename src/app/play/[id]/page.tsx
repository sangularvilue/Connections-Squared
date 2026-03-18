import { notFound } from 'next/navigation';
import Game from '../../../components/Game';
import { getPuzzleAsync } from '../../../lib/puzzles';

export const dynamic = 'force-dynamic';

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const puzzle = await getPuzzleAsync(id);
  if (!puzzle) notFound();
  return <Game puzzle={puzzle} />;
}
