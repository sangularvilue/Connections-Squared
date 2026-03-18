'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '../../components/Logo';
import { Puzzle } from '../../types';
import { savePuzzle, deletePuzzle, getAllPuzzlesAsync, validatePuzzle } from '../../lib/puzzles';

const ROW_COLORS = ['#f9df6d', '#f4a259', '#e07a7a', '#d4a0d4'];
const COL_COLORS = ['#a0c35a', '#6ec6c6', '#7ea8e0', '#b0a0e0'];

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

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen opacity-40">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminDashboard() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [editing, setEditing] = useState<Puzzle | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const loadPuzzles = useCallback(async () => {
    setLoading(true);
    const data = await getAllPuzzlesAsync();
    setPuzzles(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadPuzzles(); }, [loadPuzzles]);

  const handleEdit = (puzzle: Puzzle) => {
    setEditing(puzzle);
    setShowBuilder(true);
  };

  const handleNew = () => {
    setEditing(null);
    setShowBuilder(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete puzzle "${id}"?`)) return;
    const result = await deletePuzzle(id);
    if (result.error) {
      setStatusMsg(`Error: ${result.error}`);
    } else {
      setStatusMsg('Deleted!');
      loadPuzzles();
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSave = async (puzzle: Puzzle) => {
    const result = await savePuzzle(puzzle);
    if (result.error) {
      setStatusMsg(`Error: ${result.error}`);
    } else {
      setStatusMsg('Saved!');
      setShowBuilder(false);
      setEditing(null);
      loadPuzzles();
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (showBuilder) {
    return (
      <PuzzleBuilder
        initial={editing}
        onSave={handleSave}
        onCancel={() => { setShowBuilder(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Logo size="small" />
      <h2 className="text-lg font-bold mt-2 mb-1">Admin Dashboard</h2>

      {statusMsg && (
        <div className="rounded-lg px-4 py-2 text-sm font-semibold mb-3"
          style={{ backgroundColor: statusMsg.startsWith('Error') ? '#e07a7a' : '#a0c35a', color: '#1a1a1a' }}>
          {statusMsg}
        </div>
      )}

      <button
        onClick={handleNew}
        className="mb-4 px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
        style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', border: 'none' }}
      >
        + New Puzzle
      </button>

      {loading ? (
        <p className="opacity-40">Loading...</p>
      ) : puzzles.length === 0 ? (
        <p className="opacity-40">No puzzles yet.</p>
      ) : (
        <div className="w-full flex flex-col gap-2">
          {puzzles.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg p-3"
              style={{ backgroundColor: 'var(--tile-bg)' }}
            >
              <div>
                <div className="font-bold text-sm">{p.title || p.id}</div>
                <div className="text-xs opacity-50">{p.date} &middot; {p.id}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border"
                  style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: '#e07a7a', color: '#1a1a1a', border: 'none' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PuzzleBuilder({
  initial,
  onSave,
  onCancel,
}: {
  initial: Puzzle | null;
  onSave: (puzzle: Puzzle) => void;
  onCancel: () => void;
}) {
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

  const handleSave = () => {
    const puzzle: Puzzle = {
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

    const validationErrors = validatePuzzle(puzzle);
    if (!puzzleDate) validationErrors.push('Date is required');
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
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Logo size="small" />
      <h2 className="text-lg font-bold mt-2 mb-4">
        {initial ? 'Edit Puzzle' : 'New Puzzle'}
      </h2>

      <div className="w-full flex flex-col gap-3 mb-5">
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
          placeholder="Title (e.g. Connections² #2)"
          value={puzzleTitle}
          onChange={e => setPuzzleTitle(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
        />
      </div>

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
                onChange={e => updateColTheme(c, e.target.value)}
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

      <div className="flex gap-3 mt-5">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer border"
          style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
          style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', border: 'none' }}
        >
          Save Puzzle
        </button>
      </div>
    </div>
  );
}
