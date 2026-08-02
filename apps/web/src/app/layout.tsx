import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';
import './globals.css';

/*
 * Fonts are self-hosted through next/font, which inlines the @font-face rules
 * and preloads only the subsets in use. Nothing is fetched from a third-party
 * domain at runtime — partly for speed, and partly because a tax product should
 * not be leaking its visitors' page views to a font CDN.
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://tax.ghimtech.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GhimTech Tax — Federal and Pennsylvania tax preparation',
    template: '%s · GhimTech Tax',
  },
  description:
    'Professional Federal and Pennsylvania tax preparation software. Guided intake, document review, diagnostics before you file, and a client portal your taxpayers will actually use.',
  applicationName: 'GhimTech Tax',
  authors: [{ name: 'GhimTech' }],
  creator: 'GhimTech',
  publisher: 'GhimTech',
  keywords: [
    'tax preparation software',
    'Federal Form 1040',
    'Pennsylvania PA-40',
    'tax diagnostics',
    'client portal',
    'tax preparer software',
  ],
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'website',
    siteName: 'GhimTech Tax',
    locale: 'en_US',
    url: siteUrl,
    title: 'GhimTech Tax — Federal and Pennsylvania tax preparation',
    description:
      'Guided intake, document review, diagnostics before you file, and a client portal your taxpayers will actually use. Built by GhimTech.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GhimTech Tax',
    description:
      'Professional Federal and Pennsylvania tax preparation software. Built by GhimTech.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0d120f' },
  ],
};

/*
 * Applied before first paint so a reader who has chosen a theme never sees the
 * other one flash. It is deliberately tiny and dependency-free; anything that
 * has to run this early must not be able to fail.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('gt-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} min-h-dvh bg-canvas text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
