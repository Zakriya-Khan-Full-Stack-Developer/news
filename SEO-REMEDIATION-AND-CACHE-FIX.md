> **Historical report.** This document describes the site at the time it was written. Page counts, findings and recommendations may be out of date — see `README.md` for the current state (last reviewed 2026-10-17).

# SEO Remediation and Caching Fix for NameVerse

## Executive summary
This project already had a strong Next.js base and many pages with proper H1s and metadata. The key technical SEO issues were not an Astro leftover or a missing framework, but a combination of:

- inconsistent sitemap/robots caching behavior,
- dynamic generation on sitemap routes instead of interval-based revalidation,
- missing stronger sitewide SEO metadata signals,
- a weak or incomplete SEO document that did not clearly explain the real indexing and ranking risks,
- incomplete operational guidance for Google Search Console and page-level SEO hygiene.

This document captures the complete remediation, the rationale, and the final verification steps that were applied.

---

## Findings

### 1) Core framework and app health
- The app is not using Astro. The project is already a Next.js 14 app using `next`, `react`, and `react-dom`.
- The production build succeeds correctly.
- Pages are already structured with H1s and section headings across the main routes.
- The app is generally well-formed from a page architecture perspective.

### 2) SEO risk areas that matter for ranking and indexing
The following were the most relevant issues to address:

1. Sitemap cache policy was too aggressive and inconsistent.
   - The sitemap XML routes used `dynamic = 'force-dynamic'`, which disabled normal caching semantics.
   - This can create unnecessary churn and weak crawl efficiency signals for Google.

2. Robots and sitemap routes were not aligned to a stable 30-day cache policy.
   - Search engines benefit when robots.txt and sitemap files are stable and cacheable on a fixed interval.

3. Sitewide metadata needed stronger keyword coverage and canonical consistency.
   - Global metadata was already present, but the SEO configuration should include stronger keyword breadth and search intent coverage.

4. The project lacked a clear remediation document.
   - A developer or SEO reviewer needed a single source of truth for ranking/indexing issues and the fixes applied.

### 3) What this means for Google Search Console
The real goal is not just having a valid sitemap. It is:

- consistent crawlability,
- stable canonical signals,
- clear, descriptive titles and descriptions,
- indexable high-value pages,
- predictable cache refresh windows for sitemaps and robots files.

Dynamic sitemap generation and duplicate sitemap discovery can add unnecessary
origin and crawler work. A stable, canonical sitemap is preferable.

---

## Fixes applied

### A. Sitemap and robots are generated statically

- Sitemap and robots output is generated at build time and refreshed with each
  deployment; it does not use ISR revalidation.
- `robots.txt` advertises only the canonical `/sitemap.xml` index. The
  `/sitemap-index.xml` alias remains available for existing links but is not
  advertised as a second copy to crawlers.
- Sitemap responses use a 30-day browser cache policy. Their `lastmod` values
  reflect the build that generated them.

### B. Vercel delivery caching aligned with content freshness

- Name search-index JSON files are cached for one day in browsers and up to 30
  days at Vercel's shared edge, with stale-while-revalidate enabled. They are
  not marked `immutable`, because the filenames can be reused when the dataset
  is updated in a later deployment.
- Sitemap routes use a 30-day browser cache lifetime.
- Hashed `/_next/static/` assets retain their one-year immutable policy.
- HTML routes are generated as static output at deployment time, without ISR
  revalidation. No blanket `Cache-Control` override is applied to them.

### C. Improved metadata signal quality
The global metadata in `app/layout.jsx` was strengthened with a keyword list and more complete site-wide metadata consistency.

This helps with:
- content relevance,
- keyword coverage,
- clearer search intent handling,
- stronger search engine understanding of the site topic.

### D. SEO and indexing documentation created
A clear remediation file was created at the workspace root:

- [SEO-REMEDIATION-AND-CACHE-FIX.md](SEO-REMEDIATION-AND-CACHE-FIX.md)

This file is meant to serve as a complete operating record for the SEO cleanup effort.

---

## Important technical details

### Content freshness

Name records and editorial pages are built from repository data. Static output
is refreshed when a deployment is built, so periodic ISR revalidation is not
needed for this content.

### Why this matters for Google
Google needs stable crawl targets. A single sitemap index and deployment-time
static output keep crawl discovery consistent while repository-managed content
is updated through deployments.

---

## Files updated

- [app/layout.jsx](app/layout.jsx)
- [app/robots.js](app/robots.js)
- [app/sitemap.xml/route.js](app/sitemap.xml/route.js)
- [app/sitemap/[id]/route.js](app/sitemap/[id]/route.js)
- [SEO-REMEDIATION-AND-CACHE-FIX.md](SEO-REMEDIATION-AND-CACHE-FIX.md)

---

## Verification steps performed

- `npm run build` passed, including the static-output safety gate.
- The generated prerender manifest contains 13,592 routes and zero routes with
  ISR revalidation.
- The build output confirms all 12,438 indexable name records have prerendered
  HTML.
- Live response headers were inspected for the homepage, a name-detail page,
  sitemap, and search-index JSON. The deployed version observed during that
  check was older than the static-output changes in this repository.

---

## Recommended next actions in Google Search Console

1. Submit the sitemap again.
2. Monitor Index Coverage for page-level indexing issues.
3. Check whether any pages are being treated as duplicates or canonical conflicts.
4. Review mobile usability and Core Web Vitals.
5. Keep checking Title and H1 alignment on high-value pages like the homepage, search pages, and religion hubs.

---

## Final status
The project serves repository-generated pages as static output, avoids duplicate
sitemap discovery, retains explicit caching for JSON indexes and sitemaps, and
passes the production build and static-output checks.

This is the state required for healthier indexing and better Google crawl behavior.
