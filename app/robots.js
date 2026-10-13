// ─────────────────────────────────────────────────────────────────────────────
// NOTE — there must be exactly ONE source of robots.txt.
//
// This project previously shipped BOTH app/robots.js and public/robots.txt, and
// they did not say the same thing:
//
//   public/robots.txt   "User-agent: * / Allow: /  / Sitemap: .../sitemap-index.xml"
//   app/robots.js       the same Allow plus four Disallow rules, and
//                       "Sitemap: .../sitemap.xml"
//
// Which one is served depends on the runtime: `next start` served the static
// public/ copy (so /search, /advanced-search, /my-names and /popular-by-state
// were crawlable after all), while the Vercel deployment served this route
// handler. Two files, two answers, and no way to know which one Google saw.
// public/robots.txt has been deleted so this file is the single source of truth.
// ─────────────────────────────────────────────────────────────────────────────
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/search', '/advanced-search', '/my-names', '/popular-by-state'],
      },
    ],
    sitemap: [
      'https://nameverse.site/sitemap.xml',
    ],
  };
}
