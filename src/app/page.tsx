import Link from 'next/link';
import Logo from '../components/Logo';
import { getAllPuzzles } from '../lib/puzzles';

export default function HomePage() {
  const puzzles = getAllPuzzles();

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 max-w-lg mx-auto">
      <Logo />
      <p className="text-sm mt-2 mb-8 opacity-60 text-center">
        Find groups of four — in two dimensions
      </p>

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
                  {[0, 1, 2, 3].map(i => (
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
        })}
      </div>

      {puzzles.length === 0 && (
        <div className="text-center py-12 opacity-50">
          No puzzles yet. Check back soon!
        </div>
      )}
    </div>
  );
}
