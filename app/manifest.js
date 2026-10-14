// ─────────────────────────────────────────────────────────────────────────────
// Web app manifest.
//
// The site previously had NO manifest, no favicon and no apple-touch-icon.
// Search Console reports a missing favicon as a page-experience issue, and
// without an apple-touch-icon every iOS "Add to Home Screen" shortcut got an
// ugly screenshot-derived icon instead of the NameVerse mark.
//
// Next.js App Router serves this at /manifest.webmanifest and injects the
// <link rel="manifest"> tag automatically. The icon files live next to it:
//   app/icon.png        -> <link rel="icon">
//   app/apple-icon.png  -> <link rel="apple-touch-icon">
//   app/favicon.ico     -> served at /favicon.ico
// ─────────────────────────────────────────────────────────────────────────────
export default function manifest() {
  return {
    name: 'NameVerse — Baby Names with Meanings, Origins & Cultural Context',
    short_name: 'NameVerse',
    description:
      'Search baby names with verified meanings, origins, pronunciation, script forms and cultural context across Islamic, Christian and Hindu traditions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E2A4A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
