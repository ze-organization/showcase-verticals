import '../../globals.css';
import type { CSSProperties } from 'react';
import { Inter_Tight, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { draftMode, headers } from 'next/headers';
import Bootstrap from 'src/Bootstrap';
import client from 'src/lib/sitecore-client';
import { getDirectionFromLocale } from '@/lib/registry/locale-direction';
// Server graph counterpart of the client import in `src/Providers.tsx`.
// App Router keeps separate server/client module graphs; without this,
// Droplink GUID → name resolution only ran on the client bundle.
import '@/lib/registry/enum-manifest-loader';

const heading = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const fontTokens = {
  '--font-heading': heading.style.fontFamily,
  '--font-accent': heading.style.fontFamily,
  '--font-body': body.style.fontFamily,
  '--font-sans': body.style.fontFamily,
  '--button-font': body.style.fontFamily,
  '--font-mono': mono.style.fontFamily,
  '--font-code': mono.style.fontFamily,
} as CSSProperties;

// Root layout for the app: every routed page lives under
// /[site]/[locale], so this layout owns the html element and
// server-renders the active locale's lang/dir on first paint. It
// absorbs the former src/app/[site]/layout.tsx (the Bootstrap mount)
// because Next.js requires the topmost layout to render the html/body
// shell, and the locale param is only in scope at this depth.
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  const { isEnabled } = await draftMode();
  // In the Pages editor / preview canvas the URL does not carry the
  // editing language — the draft-mode preview data does (the same
  // source that drives the rendered content's language), so prefer it
  // to keep lang/dir in lockstep with the content. headers() stays
  // behind the draft-mode gate so published routes remain statically
  // renderable.
  let activeLocale = locale;
  if (isEnabled) {
    const previewData = client.getPreviewData(await headers()) as
      | { language?: unknown }
      | undefined;
    if (typeof previewData?.language === 'string' && previewData.language) {
      activeLocale = previewData.language;
    }
  }
  return (
    <html lang={activeLocale} dir={getDirectionFromLocale(activeLocale)}>
      <body style={fontTokens}>
        <Bootstrap siteName={site} isPreviewMode={isEnabled} />
        {children}
      </body>
    </html>
  );
}
