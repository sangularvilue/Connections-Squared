'use client';

import { useState } from 'react';
import { Puzzle } from '../types';
import { validatePuzzle } from '../lib/puzzles';

const ROW_COLORS = ['#f9df6d', '#f4a259', '#e07a7a', '#d4a0d4'];
const COL_COLORS = ['#a0c35a', '#6ec6c6', '#7ea8e0', '#b0a0e0'];

interface PuzzleBuilderProps {
  initial?: Puzzle | null;
  onSave: (puzzle: Puzzle) => void;
  saveLabel?: string;
  onCancel?: () => void;
  showMeta?: boolean;
  children?: React.ReactNode; // extra controls above the save button
}

export default function PuzzleBuilder({
  initial,
  onSave,
  saveLabel = 'Save Puzzle',
  onCancel,
  showMeta = true,
  children,
}: PuzzleBuilderProps) {
  const [matrix, setMatrix] = useState<string[][]>(
    initial?.matrix || [['','','',''],['','','',''],['','','',''],['','','','']]
  );
  const [rowThemes, setRowThemes] = useState(
    initial?.rows.map(r => r.theme) || ['', '', '', '']
  );
  const [colThemes, setColThemes] = useState(
    initial?.columns.map(c => c.theme) || ['', '', '', '']
  );
  const [puzzleId, setPuzzleId] = useState(initial?.id || '');
  const [puzzleDate, setPuzzleDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [puzzleTitle, setPuzzleTitle] = useState(initial?.title || '');
  const [errors, setErrors] = useState<string[]>([]);

  const updateCell = (r: number, c: number, value: string) => {
    const next = matrix.map(row => [...row]);
    next[r][c] = value.toUpperCase();
    setMatrix(next);
  };

  const handleSave = () => {
    const puzzle: Puzzle = {
      id: puzzleId || `custom-${Date.now()}`,
      date: puzzleDate,
      title: puzzleTitle || undefined,
      rows: rowThemes.map((theme, r) => ({
        theme,
        words: matrix[r],
        difficulty: r,
      })),
      columns: colThemes.map((theme, c) => ({
        theme,
        words: [0, 1, 2, 3].map(r => matrix[r][c]),
        difficulty: c,
      })),
      matrix,
    };

    const validationErrors = validatePuzzle(puzzle);
    if (rowThemes.some(t => !t)) validationErrors.push('All row themes required');
    if (colThemes.some(t => !t)) validationErrors.push('All column themes required');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSave(puzzle);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {showMeta && (
        <div className="w-full flex flex-col gap-3 mb-5">
          <div className="flex gap-3">
            <input
              placeholder="Puzzle ID"
              value={puzzleId}
              onChange={e => setPuzzleId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm border"
              style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <input
              type="date"
              value={puzzleDate}
              onChange={e => setPuzzleDate(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border"
              style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
        </div>
      )}

      <input
        placeholder="Puzzle title (optional)"
        value={puzzleTitle}
        onChange={e => setPuzzleTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border mb-4"
        style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
      />

      {/* Matrix editor */}
      <div className="w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: '100px repeat(4, 1fr)' }}>
          <div />
          {colThemes.map((theme, c) => (
            <div key={`ct-${c}`} className="flex flex-col gap-0.5">
              <div className="w-full h-2 rounded-t-sm" style={{ backgroundColor: COL_COLORS[c] }} />
              <input
                placeholder={`Col ${c + 1} theme`}
                value={theme}
                onChange={e => {
                  const next = [...colThemes];
                  next[c] = e.target.value;
                  setColThemes(next);
                }}
                className="w-full px-2 py-1.5 rounded text-xs border text-center"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          ))}

          {matrix.map((row, r) => (
            <div key={`row-${r}`} className="contents">
              <div className="flex items-center gap-1">
                <div className="w-2 h-full rounded-l-sm" style={{ backgroundColor: ROW_COLORS[r], minHeight: '36px' }} />
                <input
                  placeholder={`Row ${r + 1} theme`}
                  value={rowThemes[r]}
                  onChange={e => {
                    const next = [...rowThemes];
                    next[r] = e.target.value;
                    setRowThemes(next);
                  }}
                  className="w-full px-2 py-1.5 rounded text-xs border"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              </div>
              {row.map((word, c) => (
                <input
                  key={`cell-${r}-${c}`}
                  value={word}
                  onChange={e => updateCell(r, c, e.target.value)}
                  placeholder="WORD"
                  className="px-2 py-1.5 rounded text-xs border text-center font-bold uppercase"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 w-full rounded-lg p-3 text-xs" style={{ backgroundColor: '#e07a7a22', color: '#c04040' }}>
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {children}

      <div className="flex gap-3 mt-5">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer border"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
          style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', border: 'none' }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
