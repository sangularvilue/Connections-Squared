'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '../../components/Logo';

function AdminContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');

  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'letmein';

  if (key !== ADMIN_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="opacity-40">Not found</p>
      </div>
    );
  }

  return <PuzzleBuilder />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen opacity-40">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}

function PuzzleBuilder() {
  const [matrix, setMatrix] = useState<string[][]>([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ]);
  const [rowThemes, setRowThemes] = useState(['', '', '', '']);
  const [colThemes, setColThemes] = useState(['', '', '', '']);
  const [puzzleId, setPuzzleId] = useState('');
  const [puzzleDate, setPuzzleDate] = useState(new Date().toISOString().slice(0, 10));
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [output, setOutput] = useState('');

  const updateCell = (r: number, c: number, value: string) => {
    const next = matrix.map(row => [...row]);
    next[r][c] = value.toUpperCase();
    setMatrix(next);
  };

  const updateRowTheme = (i: number, value: string) => {
    const next = [...rowThemes];
    next[i] = value;
    setRowThemes(next);
  };

  const updateColTheme = (i: number, value: string) => {
    const next = [...colThemes];
    next[i] = value;
    setColThemes(next);
  };

  const generate = () => {
    const puzzle = {
      id: puzzleId || `puzzle-${Date.now()}`,
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

    // Validate
    const allWords = matrix.flat();
    const unique = new Set(allWords);
    const errors: string[] = [];
    if (unique.size !== 16) errors.push(`Need 16 unique words, got ${unique.size}`);
    if (allWords.some(w => !w)) errors.push('All cells must be filled');
    if (rowThemes.some(t => !t)) errors.push('All row themes must be filled');
    if (colThemes.some(t => !t)) errors.push('All column themes must be filled');

    if (errors.length > 0) {
      setOutput('ERRORS:\n' + errors.join('\n'));
      return;
    }

    setOutput(JSON.stringify(puzzle, null, 2));
  };

  const difficultyColors = ['#f9df6d', '#a0c35a', '#b0c4ef', '#ba81c5'];

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Logo size="small" />
      <h2 className="text-lg font-bold mt-2 mb-4">Puzzle Builder</h2>

      <div className="w-full flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <input
            placeholder="Puzzle ID (e.g. puzzle-42)"
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
        <input
          placeholder="Title (e.g. Connections² #42)"
          value={puzzleTitle}
          onChange={e => setPuzzleTitle(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
        />
      </div>

      {/* Matrix editor */}
      <div className="w-full">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: '100px repeat(4, 1fr)' }}
        >
          {/* Corner */}
          <div />

          {/* Column theme inputs */}
          {colThemes.map((theme, c) => (
            <div key={`ct-${c}`} className="flex flex-col gap-0.5">
              <div
                className="w-full h-2 rounded-t-sm"
                style={{ backgroundColor: difficultyColors[c] }}
              />
              <input
                placeholder={`Col ${c + 1} theme`}
                value={theme}
                onChange={e => updateColTheme(c, e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs border text-center"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          ))}

          {/* Rows */}
          {matrix.map((row, r) => (
            <>
              <div key={`rt-${r}`} className="flex items-center gap-1">
                <div
                  className="w-2 h-full rounded-l-sm"
                  style={{ backgroundColor: difficultyColors[r], minHeight: '36px' }}
                />
                <input
                  placeholder={`Row ${r + 1} theme`}
                  value={rowThemes[r]}
                  onChange={e => updateRowTheme(r, e.target.value)}
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
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              ))}
            </>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="mt-6 px-6 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          border: 'none',
        }}
      >
        Generate JSON
      </button>

      {output && (
        <pre
          className="mt-4 w-full p-4 rounded-lg text-xs overflow-x-auto"
          style={{ backgroundColor: 'var(--tile-bg)', whiteSpace: 'pre-wrap' }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
