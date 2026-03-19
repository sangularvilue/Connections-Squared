'use client';

import { useState } from 'react';

export default function HowToPlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 mb-6 text-xs font-semibold cursor-pointer underline"
        style={{ color: 'var(--muted)', background: 'none', border: 'none' }}
      >
        How to Play
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">How to Play</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl cursor-pointer"
                style={{ background: 'none', border: 'none', color: 'var(--foreground)' }}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm" style={{ lineHeight: 1.6 }}>
              <p>
                Find groups of words that share a theme — but in <strong>two dimensions</strong>.
              </p>

              <p>
                Puzzles come in two sizes: a <strong>4&times;4</strong> grid (16 words) or
                a <strong>3&times;3</strong> grid (9 words). Words are divided into groups
                by <strong>two</strong> different sets of categories — think of them as
                rows and columns.
              </p>

              <p>
                Each word belongs to exactly <strong>one row category</strong> and
                exactly <strong>one column category</strong>. In a 4&times;4 puzzle, find
                all 8 groups (4 row + 4 column). In a 3&times;3 puzzle, find all 6 groups
                (3 row + 3 column).
              </p>

              <h3 className="font-bold mt-1">Gameplay</h3>

              <ul className="flex flex-col gap-1.5" style={{ paddingLeft: '1.2em' }}>
                <li>Select the right number of words (4 for a 4&times;4 puzzle, 3 for a
                  3&times;3 puzzle) and tap <strong>Submit</strong>.</li>
                <li>If they all share a category, the group is revealed and the words
                  get highlighted — but they stay on the board for the other dimension.</li>
                <li>Row groups appear across the <strong>top</strong>. Column groups appear
                  down the <strong>left</strong>.</li>
                <li>In 4&times;4 puzzles, if 3 of your 4 are correct, you&apos;ll
                  see <strong>&ldquo;One away!&rdquo;</strong></li>
              </ul>

              <h3 className="font-bold mt-1">Goal</h3>

              <p>
                Find all groups. Your score is the total number of guesses — lower is better.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
