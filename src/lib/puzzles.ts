import { Puzzle, Category } from '../types';
import puzzlesData from '../data/puzzles.json';

// === JSON-file-backed puzzle data ===

// In-memory cache loaded from the JSON file at build/startup time.
// Admin mutations go through the /api/puzzles route which writes to the JSON file.
let cachedPuzzles: Puzzle[] | null = null;

function loadPuzzles(): Puzzle[] {
  if (cachedPuzzles) return cachedPuzzles;
  cachedPuzzles = (puzzlesData as any[]).map(parsePuzzle);
  return cachedPuzzles;
}

function parsePuzzle(row: any): Puzzle & { is_custom?: boolean; creator_name?: string; published?: boolean } {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    size: row.size || 4,
    published: row.published ?? true,
    rows: row.rows as Category[],
    columns: row.columns as Category[],
    matrix: row.matrix as string[][],
    is_custom: row.is_custom,
    creator_name: row.creator_name,
  } as any;
}

export async function getAllPuzzlesAsync(includePrivate = false): Promise<Puzzle[]> {
  const puzzles = loadPuzzles();
  const filtered = includePrivate ? puzzles : puzzles.filter((p: any) => p.published !== false);
  return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getUnpublishedPuzzlesAsync(): Promise<Puzzle[]> {
  const puzzles = loadPuzzles();
  return puzzles.filter((p: any) => p.published === false);
}

export async function getPuzzleAsync(id: string): Promise<Puzzle | undefined> {
  const puzzles = loadPuzzles();
  return puzzles.find(p => p.id === id);
}

// === Admin functions (call API route to persist to JSON file) ===

export async function savePuzzle(puzzle: Puzzle & { isCustom?: boolean; creatorName?: string; isPrivate?: boolean }): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/puzzles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        puzzle: {
          id: puzzle.id,
          date: puzzle.date,
          title: puzzle.title,
          size: puzzle.size || 4,
          rows: puzzle.rows,
          columns: puzzle.columns,
          matrix: puzzle.matrix,
          published: !puzzle.isPrivate,
          is_custom: puzzle.isCustom || false,
          creator_name: puzzle.creatorName || null,
        },
      }),
    });
    if (!res.ok) return { error: await res.text() };
    cachedPuzzles = null; // bust cache
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export type Visibility = 'published' | 'community' | 'private';

export async function setVisibility(id: string, visibility: Visibility): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/puzzles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setVisibility', id, visibility }),
    });
    if (!res.ok) return { error: await res.text() };
    cachedPuzzles = null;
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

/** @deprecated Use setVisibility instead */
export async function setPublished(id: string, published: boolean): Promise<{ error?: string }> {
  return setVisibility(id, published ? 'published' : 'private');
}

export async function deletePuzzle(id: string): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/puzzles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    if (!res.ok) return { error: await res.text() };
    cachedPuzzles = null;
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

// === Sync helpers (for client components that already have data) ===

export function getAllWords(puzzle: Puzzle): string[] {
  return puzzle.matrix.flat();
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function validatePuzzle(puzzle: Puzzle): string[] {
  const errors: string[] = [];
  const size = puzzle.size || 4;
  const indices = Array.from({ length: size }, (_, i) => i);

  if (puzzle.rows.length !== size) errors.push(`Must have exactly ${size} row groups`);
  if (puzzle.columns.length !== size) errors.push(`Must have exactly ${size} column groups`);
  if (puzzle.matrix.length !== size) errors.push(`Matrix must have ${size} rows`);

  const allWords = new Set<string>();
  for (const row of puzzle.matrix) {
    if (row.length !== size) errors.push(`Each matrix row must have ${size} words`);
    for (const word of row) {
      if (!word) errors.push('All cells must be filled');
      if (allWords.has(word)) errors.push(`Duplicate word: ${word}`);
      allWords.add(word);
    }
  }

  for (let r = 0; r < size; r++) {
    const matrixRow = new Set(puzzle.matrix[r]);
    const groupWords = new Set(puzzle.rows[r]?.words);
    if (![...matrixRow].every(w => groupWords.has(w))) {
      errors.push(`Row ${r} group words don't match matrix row`);
    }
  }

  for (let c = 0; c < size; c++) {
    const matrixCol = new Set(indices.map(r => puzzle.matrix[r]?.[c]));
    const groupWords = new Set(puzzle.columns[c]?.words);
    if (![...matrixCol].every(w => groupWords.has(w))) {
      errors.push(`Column ${c} group words don't match matrix column`);
    }
  }

  return errors;
}
