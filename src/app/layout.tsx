import type { Metadata } from 'next';
import { Libre_Franklin } from 'next/font/google';
import './globals.css';

const libre = Libre_Franklin({
  variable: '--font-libre',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
      <body className={`${libre.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
