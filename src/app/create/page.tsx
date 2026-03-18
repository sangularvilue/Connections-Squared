'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';
import PuzzleBuilder from '../../components/PuzzleBuilder';
import { Puzzle } from '../../types';
import { encodePuzzle, getPuzzleShareUrl } from '../../lib/puzzle-codec';
import { savePuzzle } from '../../lib/puzzles';

export default function CreatePage() {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [publishToGallery, setPublishToGallery] = useState(true);
  const [creatorName, setCreatorName] = useState('');
  const [status, setStatus] = useState('');

  const handleCreate = async (puzzle: Puzzle) => {
    const url = getPuzzleShareUrl(puzzle);
    setShareUrl(url);

    if (publishToGallery) {
      const galleryPuzzle = {
        ...puzzle,
        id: `custom-${Date.now()}`,
        title: puzzle.title || 'Untitled',
        isCustom: true,
        creatorName: creatorName || 'Anonymous',
      };
      const result = await savePuzzle(galleryPuzzle);
      if (result.error) {
        setStatus(`Saved link only (gallery error: ${result.error})`);
      } else {
        setStatus('Published to gallery!');
      }
    }
  };

  const copyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setStatus('Link copied!');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <Logo size="small" />
      <h2 className="text-lg font-bold mt-2 mb-1">Create a Puzzle</h2>
      <p className="text-xs opacity-50 mb-4 text-center">
        Build your own Connections² puzzle and share it with friends
      </p>

      {!shareUrl ? (
        <PuzzleBuilder
          onSave={handleCreate}
          saveLabel="Create Puzzle"
          showMeta={false}
        >
          <div className="w-full mt-4 flex flex-col gap-3">
            <input
              placeholder="Your name (optional)"
              value={creatorName}
              onChange={e => setCreatorName(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border"
              style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!publishToGallery}
                onChange={e => setPublishToGallery(!e.target.checked)}
                className="cursor-pointer"
              />
              Private (link only — not listed in gallery)
            </label>
          </div>
        </PuzzleBuilder>
      ) : (
        <div className="w-full flex flex-col items-center gap-4 mt-4">
          <div
            className="w-full rounded-xl p-5 text-center"
            style={{ backgroundColor: 'var(--tile-bg)', animation: 'slideDown 0.4s ease-out' }}
          >
            <div className="text-lg font-bold mb-2">Puzzle Created!</div>
            <p className="text-sm opacity-60 mb-4">
              {publishToGallery ? 'Published to gallery and ready to share' : 'Private — share the link below'}
            </p>

            <div
              className="w-full rounded-lg p-3 text-xs break-all text-left mb-3"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
            >
              {shareUrl}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={copyLink}
                className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
                style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', border: 'none' }}
              >
                Copy Link
              </button>
              <button
                onClick={() => router.push(shareUrl!.replace(window.location.origin, ''))}
                className="px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer border"
                style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)', background: 'transparent' }}
              >
                Play It
              </button>
            </div>

            {status && (
              <div className="mt-3 text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                {status}
              </div>
            )}
          </div>

          <button
            onClick={() => { setShareUrl(null); setStatus(''); }}
            className="text-sm cursor-pointer underline"
            style={{ color: 'var(--muted)', background: 'none', border: 'none' }}
          >
            Create another
          </button>
        </div>
      )}
    </div>
  );
}
