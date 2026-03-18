export interface Category {
  theme: string;
  words: string[];
  difficulty: number; // 0-3 maps to color (yellow, green, blue, purple)
}

export interface Puzzle {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  rows: Category[];    // partition P — 4 groups of 4
  columns: Category[]; // partition Q — 4 groups of 4
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
