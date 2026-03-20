import { Puzzle } from '../types';

const STORAGE_KEY = 'connections2-puzzles';

// Seed data — published by default. Only used to initialize localStorage on first visit.
const SEED_PUZZLES: Puzzle[] = [
  {
    id: 'demo-1',
    date: '2026-03-17',
    title: 'Connections² #1',
    published: true,
    rows: [
      { theme: 'Parts of a book', words: ['SPINE', 'JACKET', 'LEAF', 'APPENDIX'], difficulty: 0 },
      { theme: '___ market', words: ['BULL', 'FLEA', 'BEAR', 'STOCK'], difficulty: 1 },
      { theme: 'Starts a famous pair', words: ['SALT', 'BREAD', 'THUNDER', 'ROCK'], difficulty: 2 },
      { theme: 'Olympic events', words: ['DIVING', 'FENCING', 'ROWING', 'SHOT'], difficulty: 3 },
    ],
    columns: [
      { theme: 'Wall Street lingo', words: ['SPINE', 'BULL', 'SALT', 'DIVING'], difficulty: 0 },
      { theme: 'Medieval things', words: ['JACKET', 'FLEA', 'BREAD', 'FENCING'], difficulty: 1 },
      { theme: 'Sounds like weather', words: ['LEAF', 'BEAR', 'THUNDER', 'ROWING'], difficulty: 2 },
      { theme: '___ put', words: ['APPENDIX', 'STOCK', 'ROCK', 'SHOT'], difficulty: 3 },
    ],
    matrix: [
      ['SPINE',  'JACKET',  'LEAF',    'APPENDIX'],
      ['BULL',   'FLEA',    'BEAR',    'STOCK'],
      ['SALT',   'BREAD',   'THUNDER', 'ROCK'],
      ['DIVING', 'FENCING', 'ROWING',  'SHOT'],
    ],
  },
];

// --- localStorage-backed puzzle store ---

function loadStore(): Puzzle[] {
  if (typeof window === 'undefined') return SEED_PUZZLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit — seed
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PUZZLES));
      return SEED_PUZZLES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PUZZLES;
  }
}

function writeStore(puzzles: Puzzle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
}

// --- Public API ---

/** All puzzles (published + unpublished), sorted newest first */
export function getAllPuzzles(): Puzzle[] {
  return loadStore().sort((a, b) => b.date.localeCompare(a.date));
}

/** Only published puzzles, sorted newest first */
export function getPublishedPuzzles(): Puzzle[] {
  return getAllPuzzles().filter(p => p.published);
}

/** Only unpublished (community/draft) puzzles, sorted newest first */
export function getCommunityPuzzles(): Puzzle[] {
  return getAllPuzzles().filter(p => !p.published);
}

export function getPuzzle(id: string): Puzzle | undefined {
  return loadStore().find(p => p.id === id);
}

export function getLatestPuzzle(): Puzzle | undefined {
  return getPublishedPuzzles()[0];
}

/** Save or update a puzzle. Does NOT auto-publish. */
export function savePuzzle(puzzle: Puzzle): void {
  const store = loadStore();
  const idx = store.findIndex(p => p.id === puzzle.id);
  if (idx >= 0) {
    store[idx] = puzzle;
  } else {
    store.push(puzzle);
  }
  writeStore(store);
}

export function deletePuzzle(id: string): void {
  writeStore(loadStore().filter(p => p.id !== id));
}

export function setPublished(id: string, published: boolean): void {
  const store = loadStore();
  const puzzle = store.find(p => p.id === id);
  if (puzzle) {
    puzzle.published = published;
    writeStore(store);
  }
}

// --- Utilities (unchanged) ---

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

// Validate that a puzzle matrix is consistent with its row/column definitions
export function validatePuzzle(puzzle: Puzzle): string[] {
  const errors: string[] = [];
  const size = puzzle.size ?? 4;

  if (puzzle.rows.length !== size) errors.push(`Must have exactly ${size} row groups`);
  if (puzzle.columns.length !== size) errors.push(`Must have exactly ${size} column groups`);
  if (puzzle.matrix.length !== size) errors.push(`Matrix must have ${size} rows`);

  const allWords = new Set<string>();
  for (const row of puzzle.matrix) {
    if (row.length !== size) errors.push(`Each matrix row must have ${size} words`);
    for (const word of row) {
      if (allWords.has(word)) errors.push(`Duplicate word: ${word}`);
      allWords.add(word);
    }
  }

  // Check row groups match matrix rows
  for (let r = 0; r < size; r++) {
    const matrixRow = new Set(puzzle.matrix[r]);
    const groupWords = new Set(puzzle.rows[r]?.words);
    if (matrixRow.size !== groupWords.size || ![...matrixRow].every(w => groupWords.has(w))) {
      errors.push(`Row ${r} group words don't match matrix row`);
    }
  }

  // Check column groups match matrix columns
  for (let c = 0; c < size; c++) {
    const indices = Array.from({ length: size }, (_, i) => i);
    const matrixCol = new Set(indices.map(r => puzzle.matrix[r]?.[c]));
    const groupWords = new Set(puzzle.columns[c]?.words);
    if (matrixCol.size !== groupWords.size || ![...matrixCol].every(w => groupWords.has(w))) {
      errors.push(`Column ${c} group words don't match matrix column`);
    }
  }

  return errors;
}
