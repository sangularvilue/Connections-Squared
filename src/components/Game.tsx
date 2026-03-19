'use client';

import { useState, useEffect } from 'react';
import { Puzzle } from '../types';
import { useGame, GridCell } from '../useGame';
import Logo from './Logo';
import HowToPlay from './HowToPlay';

const ROW_COLORS = ['var(--row-0)', 'var(--row-1)', 'var(--row-2)', 'var(--row-3)'];
const COL_COLORS = ['var(--col-0)', 'var(--col-1)', 'var(--col-2)', 'var(--col-3)'];

export default function Game({ puzzle }: { puzzle: Puzzle }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-lg mx-auto">
        <Logo size="small" />
      </div>
    );
  }

  return <GameInner puzzle={puzzle} />;
}

function GameInner({ puzzle }: { puzzle: Puzzle }) {
  const {
    selected,
    size,
    guesses,
    gameOver,
    message,
    shaking,
    grid,
    rowHeaders,
    colHeaders,
    toggleWord,
    deselectAll,
    shuffle,
    submitGuess,
  } = useGame(puzzle);

  const hasColHeaders = colHeaders.some(h => h.solved);
  const hasRowHeaders = rowHeaders.some(h => h.solved);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-lg mx-auto">
      <Logo size="small" />
      <p className="text-xs mt-1 mb-4 opacity-50 text-center">
        {puzzle.title || puzzle.date}
      </p>

      {/* Toast */}
      {message && (
        <div
          className="fixed top-4 left-1/2 z-50 rounded-lg px-5 py-2.5 font-bold text-sm"
          style={{
            backgroundColor: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            transform: 'translateX(-50%)',
            animation: 'toastIn 0.2s ease-out',
          }}
        >
          {message}
        </div>
      )}

      {/* Unified 4x4 grid with optional headers */}
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: hasRowHeaders ? `64px repeat(${size}, 1fr)` : `repeat(${size}, 1fr)`,
          gridTemplateRows: hasColHeaders
            ? `40px repeat(${size}, 60px)`
            : `repeat(${size}, 60px)`,
          gap: '5px',
          animation: shaking ? 'shake 0.4s ease-in-out' : undefined,
        }}
      >
        {/* Column headers row */}
        {hasColHeaders && (
          <>
            {/* Corner cell (only if we also have row headers) */}
            {hasRowHeaders && <div />}

            {colHeaders.map((h, dc) =>
              h.solved ? (
                <div
                  key={`ch-${dc}`}
                  className="rounded-t-lg px-1 flex items-end justify-center text-center"
                  style={{
                    backgroundColor: COL_COLORS[h.difficulty],
                    color: 'var(--cat-text)',
                    animation: 'slideDown 0.3s ease-out',
                  }}
                >
                  <span className="font-bold text-[9px] uppercase tracking-wide leading-tight pb-1">
                    {h.theme}
                  </span>
                </div>
              ) : (
                <div key={`ch-${dc}`} />
              )
            )}
          </>
        )}

        {/* Grid rows */}
        {grid.map((row, dr) => (
          <>
            {/* Row header */}
            {hasRowHeaders && (
              rowHeaders[dr].solved ? (
                <div
                  key={`rh-${dr}`}
                  className="rounded-l-lg px-1.5 flex items-center justify-center text-center"
                  style={{
                    backgroundColor: ROW_COLORS[rowHeaders[dr].difficulty],
                    color: 'var(--cat-text)',
                  }}
                >
                  <span className="font-bold text-[9px] uppercase tracking-wide leading-tight">
                    {rowHeaders[dr].theme}
                  </span>
                </div>
              ) : (
                <div key={`rh-${dr}`} />
              )
            )}

            {/* Word cells */}
            {row.map((cell, dc) => (
              <WordCell
                key={`${dr}-${dc}-${cell.word}`}
                cell={cell}
                isSelected={selected.has(cell.word)}
                onClick={() => toggleWord(cell.word)}
              />
            ))}
          </>
        ))}
      </div>

      {/* Game over */}
      {gameOver && (
        <div
          className="w-full rounded-xl px-6 py-5 text-center mt-4"
          style={{
            backgroundColor: 'var(--tile-bg)',
            animation: 'slideDown 0.5s ease-out',
          }}
        >
          <div className="text-lg font-bold mb-1">Puzzle Complete!</div>
          <div className="text-sm opacity-70">
            Solved in <strong>{guesses}</strong> guess{guesses !== 1 ? 'es' : ''}
          </div>
        </div>
      )}

      {/* Controls */}
      {!gameOver && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={shuffle}
            className="px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
          >
            Shuffle
          </button>
          <button
            onClick={deselectAll}
            className="px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
          >
            Deselect All
          </button>
          <button
            onClick={submitGuess}
            disabled={selected.size !== size}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: selected.size === size ? 'var(--foreground)' : 'var(--tile-bg)',
              color: selected.size === size ? 'var(--background)' : 'var(--foreground)',
              opacity: selected.size === size ? 1 : 0.4,
              cursor: selected.size === size ? 'pointer' : 'not-allowed',
              border: 'none',
            }}
          >
            Submit
          </button>
        </div>
      )}

      <div className="mt-3 text-xs opacity-40">
        Guesses: {guesses}
      </div>

      <HowToPlay />
    </div>
  );
}

function WordCell({
  cell,
  isSelected,
  onClick,
}: {
  cell: GridCell;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { word, rowSolved, colSolved, rowDifficulty, colDifficulty } = cell;

  let bg: string;
  if (rowSolved && colSolved) {
    bg = `linear-gradient(135deg, ${ROW_COLORS[rowDifficulty]} 40%, ${COL_COLORS[colDifficulty]} 60%)`;
  } else if (rowSolved) {
    bg = ROW_COLORS[rowDifficulty];
  } else if (colSolved) {
    bg = COL_COLORS[colDifficulty];
  } else if (isSelected) {
    bg = 'var(--tile-selected)';
  } else {
    bg = 'var(--tile-bg)';
  }

  const textColor = (rowSolved || colSolved)
    ? 'var(--cat-text)'
    : isSelected
    ? 'var(--tile-selected-text)'
    : 'var(--foreground)';

  return (
    <button
      onClick={onClick}
      className="rounded-lg flex items-center justify-center font-bold uppercase cursor-pointer transition-all duration-150 select-none border-0"
      style={{
        background: bg,
        color: textColor,
        fontSize: word.length > 8 ? '11px' : word.length > 6 ? '12px' : '14px',
        letterSpacing: '0.02em',
        outline: isSelected && (rowSolved || colSolved) ? '3px solid var(--foreground)' : 'none',
        outlineOffset: '-3px',
      }}
    >
      {word}
    </button>
  );
}
