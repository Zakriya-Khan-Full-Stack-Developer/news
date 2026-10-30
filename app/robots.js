// ─────────────────────────────────────────────────────────────────────────────
// NOTE — there must be exactly ONE source of robots.txt.
//
// This project previously shipped BOTH app/robots.js and public/robots.txt, and
// they did not say the same thing. public/robots.txt has been deleted so this
// file is the single source of truth.
//
// NO DISALLOW RULES FOR NOINDEX PAGES.
// /search and /my-names are deliberately `noindex, follow`. They used to be
// listed under `disallow` here as well — but a crawler that is blocked from
// fetching a URL can never SEE its noindex tag, so a blocked URL that is
// linked from elsewhere can still be indexed (as a bare URL with no snippet).
// Google's guidance is to rely on noindex alone and leave such pages
// crawlable. /advanced-search and /popular-by-state now 301-redirect to
// /search and /baby-names-by-state (next.config.js).
// ─────────────────────────────────────────────────────────────────────────────
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: ['https://nameverse.site/sitemap.xml'],
  };
}
