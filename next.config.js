/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  // Fix 6 — compress responses and drop the framework fingerprint.
  compress: true,
  poweredByHeader: false,
  // Fix 6 — serve modern image formats and cache optimised images for 30 days.
  // (No next/image is used today, so this is inert until one is introduced;
  // it caps image transformations on the Hobby plan when that happens.)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 828, 1080, 1280],
  },
  // Keep the 216 MB dataset out of the serverless bundle. Next 15 promotes
  // this option out of `experimental`.
  outputFileTracingExcludes: {
    '/**': ['./public/names/**/*'],
  },
  experimental: {
    // Cap build workers. Each worker loads the manifest, so on a many-core
    // machine the default worker count multiplies memory use and can OOM a
    // small container. Vercel's builder is unaffected by this ceiling.
    cpus: Number(process.env.NEXT_BUILD_CPUS) || 2,
  },
  async redirects() {
    return [
      {
        source: '/homepage',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // The old unique-names route was superseded by /unique-baby-names, which
      // matches the target keyword exactly. A permanent redirect consolidates
      // any existing signals onto the new URL instead of leaving two pages
      // competing for the same query.
      {
        source: '/unique-names',
        destination: '/unique-baby-names',
        permanent: true,
      },
      // One page per search intent. /popular-names-2026 and
      // /top-baby-names-2026 rendered the same SSA and BabyCenter lists for the
      // same query family, so they competed with each other. The unique
      // analysis from the popular page now lives on /top-baby-names-2026.
      {
        source: '/popular-names-2026',
        destination: '/top-baby-names-2026',
        permanent: true,
      },
      // /popular-by-state was a "coming soon" stub that only linked onward;
      // the real state data lives on /baby-names-by-state.
      {
        source: '/popular-by-state',
        destination: '/baby-names-by-state',
        permanent: true,
      },
      // /advanced-search rendered the same component as /search and promised
      // filters that did not exist. All filters now live on /search.
      {
        source: '/advanced-search',
        destination: '/search',
        permanent: true,
      },
      // Three short (~250-word) blog posts duplicated the intent of stronger
      // evergreen pages and carried unsupported "2026 trend" claims. They were
      // consolidated into those pages; the redirects keep any links working.
      {
        source: '/blog/gender-neutral-baby-names-2026',
        destination: '/gender-neutral-names',
        permanent: true,
      },
      {
        source: '/blog/nature-inspired-baby-names',
        destination: '/nature-baby-names',
        permanent: true,
      },
      {
        source: '/blog/short-simple-modern-baby-names-2026',
        destination: '/short-baby-names',
        permanent: true,
      },
      // The old naming-framework page targeted the same query ("how to choose
      // a baby name") as the full step-by-step article, so the two competed.
      // Consolidated into the article.
      {
        source: '/guides/expert-naming-guide',
        destination: '/blog/how-to-choose-a-baby-name',
        permanent: true,
      },
      // ──────────────────────────────────────────────────────────────────────
      // LEGACY LETTER-BROWSE URLS — the single biggest cause of the stalled
      // migration.
      //
      // The site used to serve the A-Z browse pages at
      //
      //     /names/islamic/c
      //
      // and now serves them at
      //
      //     /names/islamic/letter/c
      //
      // Google still has ~14,000 pages indexed on nameverse.vercel.app under the
      // OLD shape. Vercel's automatic redirect sends each of them to
      // nameverse.site/names/<religion>/<letter> — which matches the name-detail
      // route /names/[religion]/[slug], finds no name called "c", and 404s.
      //
      // So every one of those 14,000 redirects was landing on a 404. A redirect
      // to a 404 transfers nothing: the old URL is dropped, no new URL is
      // indexed, and the new domain never accumulates pages. That is the whole
      // reason nameverse.site has been frozen at ~400 while the old host keeps
      // its 14,000.
      //
      // Verified live: https://nameverse.site/names/islamic/c -> 404.
      // Verified safe: the dataset contains ZERO single-character name slugs, so
      // this cannot shadow a real name page.
      //
      // Redirects are matched before filesystem routes, so this takes precedence
      // over /names/[religion]/[slug]. The destination has four segments and
      // cannot re-match this three-segment pattern, so there is no redirect loop.
      // ──────────────────────────────────────────────────────────────────────
      {
        source: '/names/:religion/:letter([a-z]|%23)',
        destination: '/names/:religion/letter/:letter',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
