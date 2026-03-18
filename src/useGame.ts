'use client';

import { useState, useCallback, useMemo } from 'react';
import { Puzzle, SolvedGroup } from './types';
import { getAllWords, shuffleArray } from './lib/puzzles';
import { recordPuzzleResult } from './lib/progress';

export function useGame(puzzle: Puzzle) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [solvedRows, setSolvedRows] = useState<Set<number>>(new Set());
  const [solvedCols, setSolvedCols] = useState<Set<number>>(new Set());
  const [solvedOrder, setSolvedOrder] = useState<SolvedGroup[]>([]);
  const [guesses, setGuesses] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<string[]>(() =>
    shuffleArray(getAllWords(puzzle))
  );

  const gameOver = solvedRows.size === 4 && solvedCols.size === 4;

  // Words not yet in any solved group
  const unsolvedWords = useMemo(() => {
    const inSolved = new Set<string>();
    for (const group of solvedOrder) {
      for (const word of group.words) {
        inSolved.add(word);
      }
    }
    return shuffledWords.filter(w => !inSolved.has(w));
  }, [shuffledWords, solvedOrder]);

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

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const shuffle = useCallback(() => {
    setShuffledWords(prev => shuffleArray(prev));
  }, []);

  const findMatch = useCallback((words: Set<string>): SolvedGroup | null => {
    // Check unsolved rows
    for (let i = 0; i < 4; i++) {
      if (solvedRows.has(i)) continue;
      const rowWords = puzzle.rows[i].words;
      if (rowWords.every(w => words.has(w)) && words.size === 4) {
        return {
          partition: 'row',
          index: i,
          theme: puzzle.rows[i].theme,
          words: rowWords,
          difficulty: puzzle.rows[i].difficulty,
        };
      }
    }
    // Check unsolved columns
    for (let j = 0; j < 4; j++) {
      if (solvedCols.has(j)) continue;
      const colWords = puzzle.columns[j].words;
      if (colWords.every(w => words.has(w)) && words.size === 4) {
        return {
          partition: 'col',
          index: j,
          theme: puzzle.columns[j].theme,
          words: colWords,
          difficulty: puzzle.columns[j].difficulty,
        };
      }
    }
    return null;
  }, [puzzle, solvedRows, solvedCols]);

  const checkOneAway = useCallback((words: Set<string>): boolean => {
    for (let i = 0; i < 4; i++) {
      if (!solvedRows.has(i)) {
        if (puzzle.rows[i].words.filter(w => words.has(w)).length === 3) return true;
      }
    }
    for (let j = 0; j < 4; j++) {
      if (!solvedCols.has(j)) {
        if (puzzle.columns[j].words.filter(w => words.has(w)).length === 3) return true;
      }
    }
    return false;
  }, [puzzle, solvedRows, solvedCols]);

  const submitGuess = useCallback(() => {
    if (selected.size !== 4) return;

    setGuesses(g => g + 1);
    const newGuesses = guesses + 1;

    const match = findMatch(selected);
    if (match) {
      const newSolvedRows = new Set(solvedRows);
      const newSolvedCols = new Set(solvedCols);

      if (match.partition === 'row') {
        newSolvedRows.add(match.index);
        setSolvedRows(newSolvedRows);
      } else {
        newSolvedCols.add(match.index);
        setSolvedCols(newSolvedCols);
      }

      const newSolvedOrder = [...solvedOrder, match];
      setSolvedOrder(newSolvedOrder);
      setSelected(new Set());

      // Check if game is now complete
      if (newSolvedRows.size === 4 && newSolvedCols.size === 4) {
        recordPuzzleResult(puzzle.id, newGuesses, newSolvedOrder);
      }
      return;
    }

    // Wrong guess
    if (checkOneAway(selected)) {
      showMessage('One away!');
    } else {
      showMessage('Incorrect');
    }
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    setSelected(new Set());
  }, [selected, findMatch, checkOneAway, showMessage, guesses, solvedRows, solvedCols, solvedOrder, puzzle.id]);

  return {
    selected,
    solvedRows,
    solvedCols,
    solvedOrder,
    guesses,
    gameOver,
    message,
    shaking,
    unsolvedWords,
    toggleWord,
    deselectAll,
    shuffle,
    submitGuess,
  };
}
