'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '../../components/Logo';
import PuzzleBuilder from '../../components/PuzzleBuilder';
import { Puzzle } from '../../types';
import { savePuzzle, deletePuzzle, setPublished, getAllPuzzlesAsync } from '../../lib/puzzles';

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
    const data = await getAllPuzzlesAsync(true);
    setPuzzles(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadPuzzles(); }, [loadPuzzles]);

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

  const handleTogglePublish = async (id: string, published: boolean) => {
    const result = await setPublished(id, published);
    if (result.error) {
      setStatusMsg(`Error: ${result.error}`);
    } else {
      setStatusMsg(published ? 'Published!' : 'Moved to community');
      loadPuzzles();
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (showBuilder) {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
        <Logo size="small" />
        <h2 className="text-lg font-bold mt-2 mb-4">
          {editing ? 'Edit Puzzle' : 'New Puzzle'}
        </h2>
        <PuzzleBuilder
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowBuilder(false); setEditing(null); }}
          showMeta={true}
          showSizeToggle={true}
        />
      </div>
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
        onClick={() => { setEditing(null); setShowBuilder(true); }}
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
        <div className="w-full flex flex-col gap-3">
          {puzzles.map(p => (
            <PuzzleCard
              key={p.id}
              puzzle={p}
              onEdit={() => { setEditing(p); setShowBuilder(true); }}
              onDelete={() => handleDelete(p.id)}
              onTogglePublish={() => handleTogglePublish(p.id, !(p as any).published)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PuzzleCard({ puzzle, onEdit, onDelete, onTogglePublish }: { puzzle: Puzzle; onEdit: () => void; onDelete: () => void; onTogglePublish: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isPublished = (puzzle as any).published !== false;
  const isPrivate = !isPublished;
  const isCustom = (puzzle as any).is_custom;

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--tile-bg)' }}>
      <div className="flex items-center justify-between p-3">
        <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="font-bold text-sm flex items-center gap-2">
            {puzzle.title || puzzle.id}
            {isPrivate && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>Private</span>}
            {isCustom && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#6ec6c6' }}>Community</span>}
          </div>
          <div className="text-xs opacity-50">
            {puzzle.date} &middot; {puzzle.id}
            {(puzzle as any).creator_name && ` &middot; by ${(puzzle as any).creator_name}`}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
          >
            {expanded ? 'Hide' : 'Solution'}
          </button>
          <button
            onClick={onTogglePublish}
            className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border"
            style={{
              borderColor: isPublished ? '#f4a259' : '#a0c35a',
              color: isPublished ? '#f4a259' : '#a0c35a',
              background: 'transparent',
            }}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border"
            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: '#e07a7a', color: '#1a1a1a', border: 'none' }}
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
            {/* Corner */}
            <div />
            {/* Column headers */}
            {puzzle.columns.map((col, c) => (
              <div key={`ch-${c}`} className="rounded-t px-1 py-1 text-center" style={{ backgroundColor: COL_COLORS[c], color: '#1a1a1a' }}>
                <span className="font-bold text-[9px] uppercase">{col.theme}</span>
              </div>
            ))}
            {/* Rows */}
            {puzzle.rows.map((row, r) => (
              <div key={`row-${r}`} className="contents">
                <div className="rounded-l px-1 py-1.5 flex items-center justify-center text-center" style={{ backgroundColor: ROW_COLORS[r], color: '#1a1a1a' }}>
                  <span className="font-bold text-[9px] uppercase leading-tight">{row.theme}</span>
                </div>
                {puzzle.matrix[r].map((word, c) => (
                  <div
                    key={`cell-${r}-${c}`}
                    className="rounded flex items-center justify-center text-center py-1.5 font-bold text-[10px] uppercase"
                    style={{
                      background: `linear-gradient(135deg, ${ROW_COLORS[r]}88 40%, ${COL_COLORS[c]}88 60%)`,
                      color: '#1a1a1a',
                    }}
                  >
                    {word}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
