'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '../../components/Logo';
import PuzzleBuilder from '../../components/PuzzleBuilder';
import { Puzzle } from '../../types';
import { savePuzzle, deletePuzzle, getAllPuzzlesAsync } from '../../lib/puzzles';

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
                  onClick={() => { setEditing(p); setShowBuilder(true); }}
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
