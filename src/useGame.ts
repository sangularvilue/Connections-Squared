'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Puzzle, SolvedGroup } from './types';
import { getAllWords, shuffleArray } from './lib/puzzles';
import { recordPuzzleResult } from './lib/progress';

export interface GridCell {
  word: string;
  rowSolved: boolean;
  colSolved: boolean;
  rowDifficulty: number;
  colDifficulty: number;
}

export function useGame(puzzle: Puzzle) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [solvedRowList, setSolvedRowList] = useState<number[]>([]); // row indices in solve order
  const [solvedColList, setSolvedColList] = useState<number[]>([]); // col indices in solve order
  const [solvedOrder, setSolvedOrder] = useState<SolvedGroup[]>([]);
  const [guesses, setGuesses] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  // For shuffling the unsolved words
  const [unsolvedShuffle, setUnsolvedShuffle] = useState<string[]>([]);

  const solvedRows = useMemo(() => new Set(solvedRowList), [solvedRowList]);
  const solvedCols = useMemo(() => new Set(solvedColList), [solvedColList]);

  // Shuffle all words in unsolved rows (regardless of column status)
  // This prevents solved columns from revealing row groupings
  useEffect(() => {
    const unsolved: string[] = [];
    for (let r = 0; r < 4; r++) {
      if (solvedRows.has(r)) continue;
      for (let c = 0; c < 4; c++) {
        unsolved.push(puzzle.matrix[r][c]);
      }
    }
    setUnsolvedShuffle(shuffleArray(unsolved));
  }, [puzzle, solvedRows, solvedCols]);

  const gameOver = solvedRowList.length === 4 && solvedColList.length === 4;

  // Build the 4x4 display grid
  const grid: GridCell[][] = useMemo(() => {
    const nSR = solvedRowList.length;
    const nSC = solvedColList.length;

    // For solved rows, figure out which unsolved col indices fill the right side
    const unsolvedColIndices = [0, 1, 2, 3].filter(c => !solvedCols.has(c));
    // For solved cols, figure out which unsolved row indices fill the bottom
    const unsolvedRowIndices = [0, 1, 2, 3].filter(r => !solvedRows.has(r));

    let unsolvedIdx = 0;
    const result: GridCell[][] = [];

    // Helper to look up a word's actual row/col in the matrix
    const findWordPos = (word: string) => {
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
          if (puzzle.matrix[r][c] === word) return { r, c };
      return { r: 0, c: 0 };
    };

    for (let dr = 0; dr < 4; dr++) {
      const row: GridCell[] = [];
      for (let dc = 0; dc < 4; dc++) {

        if (dr < nSR && dc < nSC) {
          // Intersection of solved row and solved col — locked position
          const actualRow = solvedRowList[dr];
          const actualCol = solvedColList[dc];
          row.push({
            word: puzzle.matrix[actualRow][actualCol],
            rowSolved: true,
            colSolved: true,
            rowDifficulty: puzzle.rows[actualRow].difficulty,
            colDifficulty: puzzle.columns[actualCol].difficulty,
          });
        } else if (dr < nSR) {
          // Solved row, unsolved col — show word in its row (row is already revealed)
          const actualRow = solvedRowList[dr];
          const actualCol = unsolvedColIndices[dc - nSC];
          row.push({
            word: puzzle.matrix[actualRow][actualCol],
            rowSolved: true,
            colSolved: false,
            rowDifficulty: puzzle.rows[actualRow].difficulty,
            colDifficulty: puzzle.columns[actualCol].difficulty,
          });
        } else {
          // Unsolved row (regardless of col status) — use shuffled word
          // This prevents solved columns from revealing row groupings
          const word = unsolvedShuffle[unsolvedIdx] || '';
          unsolvedIdx++;
          const pos = findWordPos(word);
          row.push({
            word,
            rowSolved: false,
            colSolved: false,
            rowDifficulty: puzzle.rows[pos.r].difficulty,
            colDifficulty: puzzle.columns[pos.c].difficulty,
          });
        }
      }
      result.push(row);
    }
    return result;
  }, [puzzle, solvedRowList, solvedColList, solvedRows, solvedCols, unsolvedShuffle]);

  // Row/col theme headers for the display
  const rowHeaders = useMemo(() => {
    return [0, 1, 2, 3].map(dr => {
      if (dr < solvedRowList.length) {
        const ri = solvedRowList[dr];
        return { theme: puzzle.rows[ri].theme, difficulty: puzzle.rows[ri].difficulty, solved: true };
      }
      return { theme: '', difficulty: 0, solved: false };
    });
  }, [puzzle, solvedRowList]);

  const colHeaders = useMemo(() => {
    return [0, 1, 2, 3].map(dc => {
      if (dc < solvedColList.length) {
        const ci = solvedColList[dc];
        return { theme: puzzle.columns[ci].theme, difficulty: puzzle.columns[ci].difficulty, solved: true };
      }
      return { theme: '', difficulty: 0, solved: false };
    });
  }, [puzzle, solvedColList]);

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);

  const toggleWord = useCallback((word: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else if (next.size < 4) {
        next.add(word);
      }
      return next;
    });
  }, []);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const shuffle = useCallback(() => {
    setUnsolvedShuffle(prev => shuffleArray(prev));
  }, []);

  const findMatch = useCallback((words: Set<string>): SolvedGroup | null => {
    for (let i = 0; i < 4; i++) {
      if (solvedRows.has(i)) continue;
      const rw = puzzle.rows[i].words;
      if (rw.every(w => words.has(w)) && words.size === 4) {
        return { partition: 'row', index: i, theme: puzzle.rows[i].theme, words: rw, difficulty: puzzle.rows[i].difficulty };
      }
    }
    for (let j = 0; j < 4; j++) {
      if (solvedCols.has(j)) continue;
      const cw = puzzle.columns[j].words;
      if (cw.every(w => words.has(w)) && words.size === 4) {
        return { partition: 'col', index: j, theme: puzzle.columns[j].theme, words: cw, difficulty: puzzle.columns[j].difficulty };
      }
    }
    return null;
  }, [puzzle, solvedRows, solvedCols]);

  const checkOneAway = useCallback((words: Set<string>): boolean => {
    for (let i = 0; i < 4; i++) {
      if (!solvedRows.has(i) && puzzle.rows[i].words.filter(w => words.has(w)).length === 3) return true;
    }
    for (let j = 0; j < 4; j++) {
      if (!solvedCols.has(j) && puzzle.columns[j].words.filter(w => words.has(w)).length === 3) return true;
    }
    return false;
  }, [puzzle, solvedRows, solvedCols]);

  const submitGuess = useCallback(() => {
    if (selected.size !== 4) return;
    setGuesses(g => g + 1);
    const newGuesses = guesses + 1;

    const match = findMatch(selected);
    if (match) {
      const newSolvedRowList = [...solvedRowList];
      const newSolvedColList = [...solvedColList];
      if (match.partition === 'row') {
        newSolvedRowList.push(match.index);
      } else {
        newSolvedColList.push(match.index);
      }
      const newSolvedOrder = [...solvedOrder, match];

      setSolvedRowList(newSolvedRowList);
      setSolvedColList(newSolvedColList);
      setSolvedOrder(newSolvedOrder);
      setSelected(new Set());

      if (newSolvedRowList.length === 4 && newSolvedColList.length === 4) {
        recordPuzzleResult(puzzle.id, newGuesses, newSolvedOrder);
      }
      return;
    }

    if (checkOneAway(selected)) {
      showMessage('One away!');
    } else {
      showMessage('Incorrect');
    }
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    setSelected(new Set());
  }, [selected, findMatch, checkOneAway, showMessage, guesses, solvedRowList, solvedColList, solvedOrder, puzzle.id]);

  return {
    selected,
    solvedRows,
    solvedCols,
    solvedOrder,
    guesses,
    gameOver,
    message,
    shaking,
    grid,
    rowHeaders,
    colHeaders,
    toggleWord,
    deselectAll,
    shuffle,
    submitGuess,
  };
}
