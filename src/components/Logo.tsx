'use client';

import Link from 'next/link';

export default function Logo({ size = 'large' }: { size?: 'large' | 'small' }) {
  const fontSize = size === 'large' ? 28 : 20;
  const height = size === 'large' ? 48 : 36;
  const width = size === 'large' ? 280 : 200;
  const supSize = size === 'large' ? 16 : 12;

  return (
    <Link href="/" className="no-underline">
      <div
        className="flex flex-col items-center select-none"
        aria-label="Connections Squared"
        style={{ height, width }}
      >
        <div className="relative" style={{ height, width }}>
          <span
            className="absolute font-extrabold tracking-tight whitespace-nowrap"
            style={{
              fontSize,
              top: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--foreground)',
              opacity: 0.15,
            }}
          >
            Connections
          </span>
          <span
            className="absolute font-extrabold tracking-tight whitespace-nowrap"
            style={{
              fontSize,
              top: size === 'large' ? '5px' : '3px',
              left: `calc(50% + ${size === 'large' ? 3 : 2}px)`,
              transform: 'translateX(-50%)',
              color: 'var(--foreground)',
              opacity: 0.35,
            }}
          >
            Connections
          </span>
          <span
            className="absolute font-extrabold tracking-tight whitespace-nowrap"
            style={{
              fontSize,
              top: size === 'large' ? '10px' : '6px',
              left: `calc(50% + ${size === 'large' ? 6 : 4}px)`,
              transform: 'translateX(-50%)',
              color: 'var(--foreground)',
            }}
          >
            Connections
          </span>
          <span
            className="absolute font-bold"
            style={{
              fontSize: supSize,
              top: '0px',
              right: size === 'large' ? '0px' : '-4px',
              color: 'var(--foreground)',
            }}
          >
            2
          </span>
        </div>
      </div>
    </Link>
  );
}
