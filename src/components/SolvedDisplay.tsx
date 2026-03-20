'use client';

import { Puzzle, SolvedGroup } from '../types';

const COLORS = ['var(--cat-0)', 'var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)'];

interface SolvedDisplayProps {
  puzzle: Puzzle;
  solvedOrder: SolvedGroup[];
  solvedRows: Set<number>;
  solvedCols: Set<number>;
  selected: Set<string>;
  onWordClick: (word: string) => void;
}

export default function SolvedDisplay({
  puzzle,
  solvedOrder,
  solvedRows,
  solvedCols,
  selected,
  onWordClick,
}: SolvedDisplayProps) {
  const size = puzzle.size ?? 4;

  if (solvedOrder.length === 0) return null;

  const rowOrder = solvedOrder.filter(g => g.partition === 'row').map(g => g.index);
  const colOrder = solvedOrder.filter(g => g.partition === 'col').map(g => g.index);

  const hasRows = rowOrder.length > 0;
  const hasCols = colOrder.length > 0;

  // Only rows solved: simple horizontal bars
  if (hasRows && !hasCols) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {rowOrder.map(ri => (
          <HorizontalBar
            key={`row-${ri}`}
            theme={puzzle.rows[ri].theme}
            words={puzzle.rows[ri].words}
            difficulty={puzzle.rows[ri].difficulty}
            selected={selected}
            onWordClick={onWordClick}
          />
        ))}
      </div>
    );
  }

  // Only columns solved: vertical bars
  if (hasCols && !hasRows) {
    return (
      <div className="flex flex-row gap-1.5 w-full" style={{ minHeight: '200px' }}>
        {colOrder.map(ci => (
          <VerticalBar
            key={`col-${ci}`}
            theme={puzzle.columns[ci].theme}
            words={puzzle.columns[ci].words}
            difficulty={puzzle.columns[ci].difficulty}
            selected={selected}
            onWordClick={onWordClick}
          />
        ))}
      </div>
    );
  }

  // Both: matrix layout
  // Columns shown: solved cols in solve order, then unsolved cols in original order
  const unsolvedColOrder = Array.from({ length: size }, (_, i) => i).filter(i => !solvedCols.has(i));
  const fullColOrder = [...colOrder, ...unsolvedColOrder];

  return (
    <div className="w-full" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `64px repeat(${size}, 1fr)`,
        }}
      >
        {/* Corner */}
        <div />

        {/* Column headers */}
        {fullColOrder.map(ci => {
          const solved = solvedCols.has(ci);
          if (!solved) return <div key={`ch-${ci}`} />;
          return (
            <div
              key={`ch-${ci}`}
              className="rounded-t-lg px-1 py-1.5 flex items-end justify-center text-center"
              style={{
                backgroundColor: COLORS[puzzle.columns[ci].difficulty],
                color: 'var(--cat-text)',
                minHeight: '40px',
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              <span className="font-bold text-[9px] uppercase tracking-wide leading-tight">
                {puzzle.columns[ci].theme}
              </span>
            </div>
          );
        })}

        {/* Rows */}
        {rowOrder.map(ri => (
          <MatrixRow
            key={`row-${ri}`}
            puzzle={puzzle}
            rowIdx={ri}
            colOrder={fullColOrder}
            solvedCols={solvedCols}
            selected={selected}
            onWordClick={onWordClick}
          />
        ))}
      </div>
    </div>
  );
}

function MatrixRow({
  puzzle,
  rowIdx,
  colOrder,
  solvedCols,
  selected,
  onWordClick,
}: {
  puzzle: Puzzle;
  rowIdx: number;
  colOrder: number[];
  solvedCols: Set<number>;
  selected: Set<string>;
  onWordClick: (word: string) => void;
}) {
  const row = puzzle.rows[rowIdx];
  return (
    <>
      <div
        className="rounded-l-lg px-1.5 py-1.5 flex items-center justify-center text-center"
        style={{
          backgroundColor: COLORS[row.difficulty],
          color: 'var(--cat-text)',
          minHeight: '48px',
        }}
      >
        <span className="font-bold text-[9px] uppercase tracking-wide leading-tight">
          {row.theme}
        </span>
      </div>

      {colOrder.map(ci => {
        const word = puzzle.matrix[rowIdx][ci];
        const colSolved = solvedCols.has(ci);
        const isSelected = selected.has(word);
        const rowColor = COLORS[row.difficulty];
        const colColor = COLORS[puzzle.columns[ci].difficulty];

        return (
          <button
            key={`cell-${rowIdx}-${ci}`}
            onClick={() => onWordClick(word)}
            className="rounded-md flex items-center justify-center font-bold text-xs uppercase cursor-pointer transition-all duration-150 select-none border-0"
            style={{
              background: colSolved
                ? `linear-gradient(135deg, ${rowColor} 40%, ${colColor} 60%)`
                : rowColor,
              color: 'var(--cat-text)',
              minHeight: '48px',
              outline: isSelected ? '3px solid var(--foreground)' : 'none',
              outlineOffset: '-3px',
              opacity: colSolved ? 1 : 0.75,
              fontSize: word.length > 7 ? '10px' : '12px',
            }}
          >
            {word}
          </button>
        );
      })}
    </>
  );
}

function HorizontalBar({
  theme,
  words,
  difficulty,
  selected,
  onWordClick,
}: {
  theme: string;
  words: string[];
  difficulty: number;
  selected: Set<string>;
  onWordClick: (word: string) => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: COLORS[difficulty],
        color: 'var(--cat-text)',
        animation: 'slideDown 0.4s ease-out',
      }}
    >
      <div className="px-4 pt-2 pb-0.5 text-center">
        <span className="font-bold text-sm uppercase tracking-wide">{theme}</span>
      </div>
      <div className="flex gap-1 px-2 pb-2">
        {words.map(word => (
          <button
            key={word}
            onClick={() => onWordClick(word)}
            className="flex-1 rounded-md py-1.5 text-center font-bold text-xs uppercase cursor-pointer transition-all select-none border-0"
            style={{
              background: selected.has(word) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.18)',
              outline: selected.has(word) ? '2px solid var(--foreground)' : 'none',
              color: 'var(--cat-text)',
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

function VerticalBar({
  theme,
  words,
  difficulty,
  selected,
  onWordClick,
}: {
  theme: string;
  words: string[];
  difficulty: number;
  selected: Set<string>;
  onWordClick: (word: string) => void;
}) {
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden flex flex-col"
      style={{
        backgroundColor: COLORS[difficulty],
        color: 'var(--cat-text)',
        animation: 'slideDown 0.4s ease-out',
      }}
    >
      <div className="px-2 pt-2 pb-0.5 text-center">
        <span className="font-bold text-[10px] uppercase tracking-wide">{theme}</span>
      </div>
      <div className="flex flex-col gap-1 px-2 pb-2 flex-1">
        {words.map(word => (
          <button
            key={word}
            onClick={() => onWordClick(word)}
            className="flex-1 rounded-md py-1.5 text-center font-bold text-xs uppercase cursor-pointer transition-all select-none border-0"
            style={{
              background: selected.has(word) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.18)',
              outline: selected.has(word) ? '2px solid var(--foreground)' : 'none',
              color: 'var(--cat-text)',
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
