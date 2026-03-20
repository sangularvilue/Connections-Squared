'use client';

interface TileProps {
  word: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function Tile({ word, isSelected, onClick }: TileProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-lg font-bold uppercase transition-all duration-150 select-none cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--tile-selected)' : 'var(--tile-bg)',
        color: isSelected ? 'var(--tile-selected-text)' : 'var(--foreground)',
        height: '100%',
        width: '100%',
        padding: '4px',
        fontSize: word.length > 8 ? '11px' : word.length > 6 ? '12px' : '14px',
        letterSpacing: '0.02em',
        border: 'none',
      }}
    >
      {word}
    </button>
  );
}
