import type { Metadata } from 'next';
import { Noto_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KOTO (言登) — Japanese Language Mastery Ecosystem',
  description:
    'An editorial Japanese language learning workspace covering JLPT N5–N1, kanji intelligence, grammar studio, listening & shadowing lab, and an adaptive AI Sensei tutor.',
  openGraph: {
    title: 'KOTO (言登) — Japanese Language Mastery Ecosystem',
    description:
      'An editorial Japanese language learning workspace covering JLPT N5–N1, kanji intelligence, grammar studio, listening & shadowing lab, and an adaptive AI Sensei tutor.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOTO (言登) — Japanese Language Mastery Ecosystem',
    description:
      'An editorial Japanese language learning workspace covering JLPT N5–N1, kanji intelligence, grammar studio, listening & shadowing lab, and an adaptive AI Sensei tutor.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-surface text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
