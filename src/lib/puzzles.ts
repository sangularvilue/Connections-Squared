import { Puzzle } from '../types';

// Demo puzzles — in production, these would come from a database.
// Each word belongs to exactly 1 row group AND 1 column group.
// matrix[r][c] is the unique word at the intersection of rows[r] and columns[c].

const PUZZLES: Puzzle[] = [
  {
    id: 'demo-1',
    date: '2026-03-17',
    title: 'Connections² #1',
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

export function getAllPuzzles(): Puzzle[] {
  return [...PUZZLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPuzzle(id: string): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getLatestPuzzle(): Puzzle | undefined {
  return getAllPuzzles()[0];
}

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

  if (puzzle.rows.length !== 4) errors.push('Must have exactly 4 row groups');
  if (puzzle.columns.length !== 4) errors.push('Must have exactly 4 column groups');
  if (puzzle.matrix.length !== 4) errors.push('Matrix must have 4 rows');

  const allWords = new Set<string>();
  for (const row of puzzle.matrix) {
    if (row.length !== 4) errors.push('Each matrix row must have 4 words');
    for (const word of row) {
      if (allWords.has(word)) errors.push(`Duplicate word: ${word}`);
      allWords.add(word);
    }
  }

  // Check row groups match matrix rows
  for (let r = 0; r < 4; r++) {
    const matrixRow = new Set(puzzle.matrix[r]);
    const groupWords = new Set(puzzle.rows[r]?.words);
    if (matrixRow.size !== groupWords.size || ![...matrixRow].every(w => groupWords.has(w))) {
      errors.push(`Row ${r} group words don't match matrix row`);
    }
  }

  // Check column groups match matrix columns
  for (let c = 0; c < 4; c++) {
    const matrixCol = new Set([0, 1, 2, 3].map(r => puzzle.matrix[r]?.[c]));
    const groupWords = new Set(puzzle.columns[c]?.words);
    if (matrixCol.size !== groupWords.size || ![...matrixCol].every(w => groupWords.has(w))) {
      errors.push(`Column ${c} group words don't match matrix column`);
    }
  }

  return errors;
}
