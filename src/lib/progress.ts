'use client';

import { UserProgress, PuzzleResult } from '../types';

const STORAGE_KEY = 'connections-squared-progress';

function getDefaultProgress(): UserProgress {
  return {
    odometer: 0,
    puzzleResults: {},
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw);
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordPuzzleResult(puzzleId: string, guesses: number, solvedOrder: any[]): void {
  const progress = loadProgress();
  const today = new Date().toISOString().slice(0, 10);

  const result: PuzzleResult = {
    puzzleId,
    completed: true,
    guesses,
    solvedOrder,
    date: today,
  };

  progress.puzzleResults[puzzleId] = result;
  progress.odometer++;

  // Update streak
  if (progress.lastPlayedDate) {
    const lastDate = new Date(progress.lastPlayedDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.currentStreak++;
    } else if (diffDays > 1) {
      progress.currentStreak = 1;
    }
    // diffDays === 0 means same day, streak stays
  } else {
    progress.currentStreak = 1;
  }

  progress.maxStreak = Math.max(progress.maxStreak, progress.currentStreak);
  progress.lastPlayedDate = today;

  saveProgress(progress);
}

export function getPuzzleResult(puzzleId: string): PuzzleResult | undefined {
  const progress = loadProgress();
  return progress.puzzleResults[puzzleId];
}
