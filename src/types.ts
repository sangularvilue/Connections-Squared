export interface Category {
  theme: string;
  words: string[];
  difficulty: number; // 0-3 maps to color (yellow, green, blue, purple)
}

export interface Puzzle {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  size?: 3 | 4; // grid dimension — 3x3 or 4x4 (default 4)
  published?: boolean; // true = shows on home page, false = community/draft
  rows: Category[];    // partition P — N groups of N
  columns: Category[]; // partition Q — N groups of N
  // matrix[r][c] = the unique word in rows[r] ∩ columns[c]
  matrix: string[][];
}

export type PartitionType = 'row' | 'col';

export interface SolvedGroup {
  partition: PartitionType;
  index: number;
  theme: string;
  words: string[];
  difficulty: number;
}

export interface UserProgress {
  odometer: number;
  puzzleResults: Record<string, PuzzleResult>;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
}

export interface PuzzleResult {
  puzzleId: string;
  completed: boolean;
  guesses: number;
  solvedOrder: SolvedGroup[];
  date: string;
}
