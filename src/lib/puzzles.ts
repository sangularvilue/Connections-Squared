import { Puzzle, Category } from '../types';

// === Supabase-backed puzzle fetching ===

let supabaseClient: any = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    const { supabase } = await import('./supabase');
    supabaseClient = supabase;
    return supabase;
  } catch {
    return null;
  }
}

function parseDbPuzzle(row: any): Puzzle & { is_custom?: boolean; creator_name?: string; published?: boolean } {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    size: row.size || 4,
    published: row.published,
    rows: row.rows as Category[],
    columns: row.columns as Category[],
    matrix: row.matrix as string[][],
    is_custom: row.is_custom,
    creator_name: row.creator_name,
  } as any;
}

export async function getAllPuzzlesAsync(includePrivate = false): Promise<Puzzle[]> {
  const sb = await getSupabase();
  if (sb) {
    let query = sb.from('puzzles').select('*').order('date', { ascending: false });
    if (!includePrivate) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(parseDbPuzzle);
    }
  }
  // Fallback to hardcoded
  return [...FALLBACK_PUZZLES].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPuzzleAsync(id: string): Promise<Puzzle | undefined> {
  const sb = await getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
      return parseDbPuzzle(data);
    }
  }
  return FALLBACK_PUZZLES.find(p => p.id === id);
}

// === Admin functions ===

export async function savePuzzle(puzzle: Puzzle & { isCustom?: boolean; creatorName?: string; isPrivate?: boolean }): Promise<{ error?: string }> {
  const sb = await getSupabase();
  if (!sb) return { error: 'Supabase not configured' };

  const { error } = await sb
    .from('puzzles')
    .upsert({
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
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };
  return {};
}

export async function setPublished(id: string, published: boolean): Promise<{ error?: string }> {
  const sb = await getSupabase();
  if (!sb) return { error: 'Supabase not configured' };

  const { error } = await sb
    .from('puzzles')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  return {};
}

export async function deletePuzzle(id: string): Promise<{ error?: string }> {
  const sb = await getSupabase();
  if (!sb) return { error: 'Supabase not configured' };

  const { error } = await sb.from('puzzles').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
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

// === Fallback hardcoded puzzle ===

const FALLBACK_PUZZLES: Puzzle[] = [
  {
    id: 'square-one',
    date: '2026-03-22',
    title: 'Square One',
    rows: [
      { theme: 'White ___', words: ['CHRISTMAS', 'PAGES', 'SUPREMACY', 'LIGHT'], difficulty: 0 },
      { theme: 'Relative ___', words: ['POVERTY', 'MOTION', 'STATE', 'POWER'], difficulty: 1 },
      { theme: 'Running ___', words: ['DRUGS', 'NUMBERS', 'JUMP', 'BATH'], difficulty: 2 },
      { theme: 'Hidden ___', words: ['TERROR', 'CAMERA', 'FIELD', 'TREASURE'], difficulty: 3 },
    ],
    columns: [
      { theme: 'War on ___', words: ['CHRISTMAS', 'POVERTY', 'DRUGS', 'TERROR'], difficulty: 0 },
      { theme: 'Apple software', words: ['PAGES', 'MOTION', 'NUMBERS', 'CAMERA'], difficulty: 1 },
      { theme: 'Quantum ___', words: ['SUPREMACY', 'STATE', 'JUMP', 'FIELD'], difficulty: 2 },
      { theme: '___ house', words: ['LIGHT', 'POWER', 'BATH', 'TREASURE'], difficulty: 3 },
    ],
    matrix: [
      ['CHRISTMAS', 'PAGES',   'SUPREMACY', 'LIGHT'],
      ['POVERTY',   'MOTION',  'STATE',     'POWER'],
      ['DRUGS',     'NUMBERS', 'JUMP',      'BATH'],
      ['TERROR',    'CAMERA',  'FIELD',     'TREASURE'],
    ],
  },
];
