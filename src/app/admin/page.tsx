'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '../../components/Logo';
import { Puzzle } from '../../types';
import {
  getAllPuzzles,
  savePuzzle,
  deletePuzzle,
  setPublished,
} from '../../lib/puzzles';

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
  const [size, setSize] = useState<3 | 4>(4);
  const [matrix, setMatrix] = useState<string[][]>(makeEmptyMatrix(4));
  const [rowThemes, setRowThemes] = useState<string[]>(Array(4).fill(''));
  const [colThemes, setColThemes] = useState<string[]>(Array(4).fill(''));
  const [puzzleId, setPuzzleId] = useState('');
  const [puzzleDate, setPuzzleDate] = useState(new Date().toISOString().slice(0, 10));
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [output, setOutput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([]);

  const refreshPuzzles = useCallback(() => {
    setAllPuzzles(getAllPuzzles());
  }, []);

  useEffect(() => {
    refreshPuzzles();
  }, [refreshPuzzles]);

  function makeEmptyMatrix(n: number): string[][] {
    return Array.from({ length: n }, () => Array(n).fill(''));
  }

  const changeSize = (newSize: 3 | 4) => {
    if (newSize === size) return;
    setSize(newSize);
    setMatrix(makeEmptyMatrix(newSize));
    setRowThemes(Array(newSize).fill(''));
    setColThemes(Array(newSize).fill(''));
    setOutput('');
  };

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

  const buildPuzzle = (forcePublished?: boolean): { puzzle: Puzzle; errors: string[] } => {
    const totalWords = size * size;
    const allWords = matrix.flat();
    const unique = new Set(allWords);
    const errors: string[] = [];
    if (unique.size !== totalWords) errors.push(`Need ${totalWords} unique words, got ${unique.size}`);
    if (allWords.some(w => !w)) errors.push('All cells must be filled');
    if (rowThemes.some(t => !t)) errors.push('All row themes must be filled');
    if (colThemes.some(t => !t)) errors.push('All column themes must be filled');

    const puzzle: Puzzle = {
      id: puzzleId || `puzzle-${Date.now()}`,
      date: puzzleDate,
      title: puzzleTitle || undefined,
      size,
      published: forcePublished ?? false,
      rows: rowThemes.map((theme, r) => ({
        theme,
        words: matrix[r],
        difficulty: r,
      })),
      columns: colThemes.map((theme, c) => ({
        theme,
        words: Array.from({ length: size }, (_, r) => matrix[r][c]),
        difficulty: c,
      })),
      matrix,
    };

    return { puzzle, errors };
  };

  const save = (publish: boolean) => {
    const { puzzle, errors } = buildPuzzle(publish);
    if (errors.length > 0) {
      setOutput('ERRORS:\n' + errors.join('\n'));
      return;
    }
    savePuzzle(puzzle);
    refreshPuzzles();
    setEditingId(puzzle.id);
    setPuzzleId(puzzle.id);
    setOutput(publish ? `Published: "${puzzle.title || puzzle.id}"` : `Saved as community: "${puzzle.title || puzzle.id}"`);
  };

  const loadPuzzle = (p: Puzzle) => {
    const s = p.size ?? 4;
    setSize(s as 3 | 4);
    setMatrix(p.matrix);
    setRowThemes(p.rows.map(r => r.theme));
    setColThemes(p.columns.map(c => c.theme));
    setPuzzleId(p.id);
    setPuzzleDate(p.date);
    setPuzzleTitle(p.title || '');
    setEditingId(p.id);
    setOutput('');
    setShowManage(false);
  };

  const handleDelete = (id: string) => {
    deletePuzzle(id);
    refreshPuzzles();
    if (editingId === id) {
      newPuzzle();
    }
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    setPublished(id, published);
    refreshPuzzles();
    setOutput(published ? `Published: "${id}"` : `Moved to community: "${id}"`);
  };

  const newPuzzle = () => {
    setSize(4);
    setMatrix(makeEmptyMatrix(4));
    setRowThemes(Array(4).fill(''));
    setColThemes(Array(4).fill(''));
    setPuzzleId('');
    setPuzzleDate(new Date().toISOString().slice(0, 10));
    setPuzzleTitle('');
    setEditingId(null);
    setOutput('');
  };

  const difficultyColors = ['#f9df6d', '#a0c35a', '#b0c4ef', '#ba81c5'];
  const indices = Array.from({ length: size }, (_, i) => i);

  const publishedPuzzles = allPuzzles.filter(p => p.published);
  const communityPuzzles = allPuzzles.filter(p => !p.published);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Logo size="small" />
      <h2 className="text-lg font-bold mt-2 mb-1">Puzzle Builder</h2>

      {editingId && (
        <p className="text-xs opacity-50 mb-3">
          Editing: {editingId}
        </p>
      )}

      {/* Top bar */}
      <div className="w-full flex gap-2 mb-4">
        <button
          onClick={newPuzzle}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border"
          style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
        >
          New
        </button>
        <button
          onClick={() => setShowManage(!showManage)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border"
          style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
        >
          Manage ({allPuzzles.length})
        </button>
        <div className="flex-1" />
        {/* Size toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {([3, 4] as const).map(s => (
            <button
              key={s}
              onClick={() => changeSize(s)}
              className="px-3 py-1.5 text-xs font-semibold cursor-pointer border-0"
              style={{
                backgroundColor: size === s ? 'var(--foreground)' : 'transparent',
                color: size === s ? 'var(--background)' : 'var(--foreground)',
              }}
            >
              {s}x{s}
            </button>
          ))}
        </div>
      </div>

      {/* Manage panel */}
      {showManage && (
        <div
          className="w-full rounded-xl p-4 mb-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--tile-bg)' }}
        >
          {/* Published */}
          <div>
            <h3 className="text-xs font-semibold opacity-50 uppercase tracking-wide mb-2">
              Published ({publishedPuzzles.length})
            </h3>
            {publishedPuzzles.length === 0 && (
              <p className="text-xs opacity-40 py-1">None</p>
            )}
            {publishedPuzzles.map(p => (
              <PuzzleRow
                key={p.id}
                puzzle={p}
                onEdit={() => loadPuzzle(p)}
                onDelete={() => handleDelete(p.id)}
                onTogglePublish={() => handleTogglePublish(p.id, false)}
                publishLabel="Unpublish"
              />
            ))}
          </div>

          {/* Community / unpublished */}
          <div>
            <h3 className="text-xs font-semibold opacity-50 uppercase tracking-wide mb-2">
              Community ({communityPuzzles.length})
            </h3>
            {communityPuzzles.length === 0 && (
              <p className="text-xs opacity-40 py-1">None</p>
            )}
            {communityPuzzles.map(p => (
              <PuzzleRow
                key={p.id}
                puzzle={p}
                onEdit={() => loadPuzzle(p)}
                onDelete={() => handleDelete(p.id)}
                onTogglePublish={() => handleTogglePublish(p.id, true)}
                publishLabel="Publish"
              />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
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
          style={{ gridTemplateColumns: `100px repeat(${size}, 1fr)` }}
        >
          {/* Corner */}
          <div />

          {/* Column theme inputs */}
          {indices.map(c => (
            <div key={`ct-${c}`} className="flex flex-col gap-0.5">
              <div
                className="w-full h-2 rounded-t-sm"
                style={{ backgroundColor: difficultyColors[c] }}
              />
              <input
                placeholder={`Col ${c + 1} theme`}
                value={colThemes[c]}
                onChange={e => updateColTheme(c, e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs border text-center"
                style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          ))}

          {/* Rows */}
          {indices.map(r => (
            <div key={`row-${r}`} className="contents">
              <div className="flex items-center gap-1">
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
              {indices.map(c => (
                <input
                  key={`cell-${r}-${c}`}
                  value={matrix[r][c]}
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
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => save(false)}
          className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            border: '2px solid var(--foreground)',
          }}
        >
          Save as Community
        </button>
        <button
          onClick={() => save(true)}
          className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--foreground)',
            color: 'var(--background)',
            border: 'none',
          }}
        >
          Publish
        </button>
      </div>

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

function PuzzleRow({
  puzzle,
  onEdit,
  onDelete,
  onTogglePublish,
  publishLabel,
}: {
  puzzle: Puzzle;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  publishLabel: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2 mb-1"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">
          {puzzle.title || puzzle.id}
          <span className="ml-2 text-xs opacity-40">{puzzle.size ?? 4}x{puzzle.size ?? 4}</span>
        </div>
        <div className="text-xs opacity-40">{puzzle.date}</div>
      </div>
      <div className="flex gap-1 ml-2 shrink-0">
        <button
          onClick={onEdit}
          className="px-2 py-1 rounded text-xs font-semibold cursor-pointer border"
          style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
        >
          Edit
        </button>
        <button
          onClick={onTogglePublish}
          className="px-2 py-1 rounded text-xs font-semibold cursor-pointer border"
          style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
        >
          {publishLabel}
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 rounded text-xs font-semibold cursor-pointer"
          style={{ background: 'transparent', color: '#e55', border: '1px solid #e55' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
