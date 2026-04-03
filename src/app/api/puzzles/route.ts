import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PUZZLES_PATH = path.join(process.cwd(), 'src', 'data', 'puzzles.json');

function readPuzzles(): any[] {
  const raw = fs.readFileSync(PUZZLES_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writePuzzles(puzzles: any[]) {
  fs.writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2) + '\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save') {
      const { puzzle } = body;
      const puzzles = readPuzzles();
      const idx = puzzles.findIndex((p: any) => p.id === puzzle.id);
      if (idx >= 0) {
        puzzles[idx] = { ...puzzles[idx], ...puzzle, updated_at: new Date().toISOString() };
      } else {
        puzzles.unshift({ ...puzzle, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      writePuzzles(puzzles);
      return NextResponse.json({ ok: true });
    }

    if (action === 'setVisibility') {
      const { id, visibility } = body;
      const puzzles = readPuzzles();
      const puzzle = puzzles.find((p: any) => p.id === id);
      if (!puzzle) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      puzzle.published = visibility !== 'private';
      puzzle.is_custom = visibility === 'community';
      puzzle.updated_at = new Date().toISOString();
      writePuzzles(puzzles);
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      const { id } = body;
      const puzzles = readPuzzles().filter((p: any) => p.id !== id);
      writePuzzles(puzzles);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
