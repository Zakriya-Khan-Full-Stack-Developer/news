import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Canonical-host enforcement.
//
// WHY THIS FILE EXISTS
// A domain migration has exactly one non-negotiable requirement: every URL on
// the old host must return a single 301 to its counterpart on the new host.
// Until that is true, Google is not looking at a migrated site — it is looking
// at TWO sites publishing the same pages. It keeps whichever one it already
// knows and trusts (the old one, with its 14,000 indexed URLs and its history),
// and the new one gets classified as "Duplicate, Google chose different
// canonical than user" or "Crawled — currently not indexed". That is precisely
// the symptom of "old domain 14k, new domain stuck at 400".
//
// Nothing in this repo was doing that job:
//   - next.config.js `redirects()` can only rewrite a path on the SAME host.
//   - vercel.json had no `redirects` block at all.
//   - Every canonical tag already pointed at https://nameverse.site, which is
//     correct, but a canonical tag is a hint — a 301 is an instruction. Without
//     the 301 the old host keeps serving 200s and the canonical is just a
//     suggestion that arrives far too late in the crawl pipeline.
//
// WHAT THIS DOES
//   1. 301-redirects every host we own to https://nameverse.site, preserving
//      the path and query string, so the redirect is one-to-one (URL-for-URL),
//      which is what carries ranking signals across a move.
//   2. Covers www.nameverse.site and any *.vercel.app host automatically.
//   3. Lets you list the old host(s) in the LEGACY_HOSTS env var without
//      touching code — set LEGACY_HOSTS to the subdomain you migrated from.
//
// Hosts we do NOT own are passed through untouched, so a forged Host header
// cannot be used to bounce a visitor at an arbitrary domain.
// ─────────────────────────────────────────────────────────────────────────────

const CANONICAL_HOST = (process.env.NEXT_PUBLIC_CANONICAL_HOST || 'nameverse.site').toLowerCase();

// Comma-separated list of the hosts you migrated FROM, e.g.
//   LEGACY_HOSTS=names.example.com,babynames.example.com
const LEGACY_HOSTS = (process.env.LEGACY_HOSTS || '')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

export function middleware(request) {
  const hostHeader = request.headers.get('host') || '';
  // Strip any port. Local dev (localhost:3000) falls through untouched so
  // `npm run dev` and `next start` keep working.
  const host = hostHeader.toLowerCase().split(':')[0];

  if (!host || host === CANONICAL_HOST) return NextResponse.next();

  const isCanonicalSubdomain =
    host === `www.${CANONICAL_HOST}` || host.endsWith(`.${CANONICAL_HOST}`);
  // Vercel keeps serving every project at <project>.vercel.app forever, and
  // that host is fully indexable. It must never serve a 200 alongside the
  // custom domain.
  const isVercelHost = host.endsWith('.vercel.app');
  const isLegacyHost = LEGACY_HOSTS.includes(host);

  if (!isCanonicalSubdomain && !isVercelHost && !isLegacyHost) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = 'https';
  url.host = CANONICAL_HOST;
  url.port = '';
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Run on everything except build assets and Vercel's own internal routes.
  // Sitemaps and robots.txt ARE included: a crawler that still has the old
  // sitemap URL on file needs to be redirected to the new one, not 404'd.
  matcher: ['/((?!_next/static|_next/image|_vercel|favicon.ico).*)'],
};
