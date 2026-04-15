import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'zkSentinel - AI Security Agent for Web3',
  description:
    'Autonomous AI security agent for Web3 wallet protection with zero-knowledge proofs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
