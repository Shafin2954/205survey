import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://stat205-survey.vercel.app'),
  title: 'Living Conditions, Background & Financial Behavior — Survey',
  description:
    'A research survey investigating how living arrangement and family background relate to financial habits, budgeting discipline, and online impulse buying among university students in Bangladesh.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link href="/" className="site-header__title">
              Money Personality Study
            </Link>
            <span className="site-header__right">
              Demography Research · 2026
            </span>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            <p>
              Living Conditions, Background, and Financial Behavior — Demography Course Research
            </p>
            <p style={{ marginTop: '0.25rem' }}>
              All responses are anonymous. Result cards are for fun — not official findings.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
