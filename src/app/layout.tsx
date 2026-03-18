import type { Metadata } from 'next';
import { Libre_Franklin, UnifrakturCook, Noto_Serif } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const libre = Libre_Franklin({
  variable: '--font-libre',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const fraktur = UnifrakturCook({
  variable: '--font-fraktur',
  subsets: ['latin'],
  weight: '700',
});

const serif = Noto_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Connections²',
  description: 'Find groups of four — in two dimensions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${libre.className} ${fraktur.variable} ${serif.variable} antialiased`}>
        <header
          className="flex items-center px-4 py-2"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/" className="flex items-center no-underline" style={{ color: 'var(--foreground)', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-fraktur)', fontSize: '36px', lineHeight: 1 }}>G</span>
            <span style={{ width: '1px', height: '24px', backgroundColor: 'var(--foreground)', opacity: 0.3 }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>Games</span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
