import { Puzzle } from '../types';

// Compact encoding: JSON → Base64url (no compression needed, puzzles are small)

interface CompactPuzzle {
  t?: string; // title
  m: string[][]; // 4x4 matrix
  r: [string, number][]; // row [theme, difficulty]
  c: [string, number][]; // col [theme, difficulty]
}

export function encodePuzzle(puzzle: Puzzle): string {
  const compact: CompactPuzzle = {
    t: puzzle.title,
    m: puzzle.matrix,
    r: puzzle.rows.map(r => [r.theme, r.difficulty]),
    c: puzzle.columns.map(c => [c.theme, c.difficulty]),
  };
  const json = JSON.stringify(compact);
  // Base64url encode (browser-safe, no padding)
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return b64;
}

export function decodePuzzle(encoded: string): Puzzle | null {
  try {
    // Restore standard Base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = decodeURIComponent(escape(atob(b64)));
    const compact: CompactPuzzle = JSON.parse(json);

    if (!compact.m || compact.m.length !== 4 || compact.r?.length !== 4 || compact.c?.length !== 4) {
      return null;
    }

    // Reconstruct full puzzle
    const puzzle: Puzzle = {
      id: `custom-${encoded.slice(0, 12)}`,
      date: new Date().toISOString().slice(0, 10),
      title: compact.t,
      rows: compact.r.map(([theme, difficulty], i) => ({
        theme,
        difficulty,
        words: compact.m[i],
      })),
      columns: compact.c.map(([theme, difficulty], j) => ({
        theme,
        difficulty,
        words: [0, 1, 2, 3].map(i => compact.m[i][j]),
      })),
      matrix: compact.m,
    };

    return puzzle;
  } catch {
    return null;
  }
}

export function getPuzzleShareUrl(puzzle: Puzzle): string {
  const encoded = encodePuzzle(puzzle);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/play/custom?d=${encoded}`;
}
