'use client';

import { Puzzle } from '../types';
import { useGame } from '../useGame';
import Logo from './Logo';
import Tile from './Tile';
import SolvedDisplay from './SolvedDisplay';

export default function Game({ puzzle }: { puzzle: Puzzle }) {
  const {
    selected,
    solvedRows,
    solvedCols,
    solvedOrder,
    guesses,
    gameOver,
    message,
    shaking,
    unsolvedWords,
    toggleWord,
    deselectAll,
    shuffle,
    submitGuess,
  } = useGame(puzzle);

  const size = puzzle.size ?? 4;
  const gridRows = Math.ceil(unsolvedWords.length / size);

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

      {/* Solved area */}
      <div className="w-full mb-2">
        <SolvedDisplay
          puzzle={puzzle}
          solvedOrder={solvedOrder}
          solvedRows={solvedRows}
          solvedCols={solvedCols}
          selected={selected}
          onWordClick={toggleWord}
        />
      </div>

      {/* Unsolved grid */}
      {unsolvedWords.length > 0 && (
        <div
          className={shaking ? 'w-full' : 'w-full'}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 60px)`,
            gap: '6px',
            animation: shaking ? 'shake 0.4s ease-in-out' : undefined,
          }}
        >
          {unsolvedWords.map(word => (
            <Tile
              key={word}
              word={word}
              isSelected={selected.has(word)}
              onClick={() => toggleWord(word)}
            />
          ))}
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div
          className="w-full rounded-xl px-6 py-5 text-center mt-3"
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
    </div>
  );
}
