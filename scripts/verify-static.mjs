// ─────────────────────────────────────────────────────────────────────────────
// NameVerse — Static-output safety gate
//
// THE REGRESSION THIS PREVENTS
// The site was paused on Vercel because Fluid Active CPU hit 12h 15m against a
// 4h allowance. The cause was a single line: the name detail route declared
// `dynamicParams = true` and prerendered only the top 4,000 names, so ~9,800
// indexable pages were rendered on demand — each one re-running the full
// normalise + enrich + compose pipeline.
//
// That is a silent failure mode: the build succeeds, the route table looks
// fine, and the cost only shows up on the Vercel bill. This script makes it
// loud. It runs after `next build` and FAILS if any of the following is true:
//
//   1. The build emitted a dynamic (ƒ) route. Every route must be static (○)
//      or prerendered SSG (●).
//   2. A route that should be fully prerendered declares `dynamicParams = true`
//      in its source, which would let unknown paths render on demand.
//   3. An indexable manifest record has no prerendered HTML file, meaning it
//      would have to be rendered on demand.
//   4. The sitemap publishes a URL that has no prerendered page behind it.
//
// Run:  node scripts/verify-static.mjs
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, '.next');
const APP_DIR = path.join(NEXT_DIR, 'server', 'app');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'data', 'names-manifest.json');

const failures = [];
const notes = [];

function fail(msg) {
  failures.push(msg);
}

// ── 1. No dynamic routes in the build output ────────────────────────────────
// Next.js writes the route table to stdout, not to a file, so we inspect the
// prerender manifest instead: every route in it must have been prerendered.
const prerenderManifestPath = path.join(NEXT_DIR, 'prerender-manifest.json');
if (!fs.existsSync(prerenderManifestPath)) {
  fail('prerender-manifest.json not found — run `next build` first.');
} else {
  const pm = JSON.parse(fs.readFileSync(prerenderManifestPath, 'utf8'));
  const routes = Object.keys(pm.routes || {});
  const dynamicRoutes = Object.keys(pm.dynamicRoutes || {});
  notes.push(`prerendered routes: ${routes.length}`);
  notes.push(`dynamic routes: ${dynamicRoutes.length}`);

  // A dynamic route entry with `fallback: null` and no prerendered paths is the
  // on-demand SSR case we are eliminating.
  for (const [route, cfg] of Object.entries(pm.dynamicRoutes || {})) {
    const routePattern = new RegExp(
      `^${route
        .split('/')
        .map((segment) =>
          /^\[[^\]]+\]$/.test(segment)
            ? '[^/]+'
            : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        )
        .join('/')}$`
    );
    const hasPrerendered = routes.some((r) => routePattern.test(r));
    if (!hasPrerendered) {
      fail(`dynamic route with no prerendered paths: ${route} (fallback=${cfg.fallback})`);
    }
  }
}

// ── 1b. Every non-parameterised app route must be prerendered ───────────────
// A route with no [segments] that is missing from the prerender manifest was
// built as a server function (ƒ) — e.g. /sitemap-index.xml, whose re-exported
// handler is not statically analysable. Check 1 only covers [param] routes.
const appRoutesPath = path.join(NEXT_DIR, 'app-path-routes-manifest.json');
if (fs.existsSync(appRoutesPath) && fs.existsSync(prerenderManifestPath)) {
  const appRoutes = Object.values(JSON.parse(fs.readFileSync(appRoutesPath, 'utf8')));
  const pm = JSON.parse(fs.readFileSync(prerenderManifestPath, 'utf8'));
  const staticRoutes = new Set(Object.keys(pm.routes || {}));
  const fnRoutes = appRoutes.filter((r) => !r.includes('[') && r !== '/_not-found' && !staticRoutes.has(r));
  notes.push(`app routes: ${appRoutes.length} · server-rendered (ƒ): ${fnRoutes.length}`);
  if (fnRoutes.length) {
    fail(`route(s) built as server functions (ƒ): ${fnRoutes.join(', ')} — add \`export const dynamic = 'force-static'\``);
  }
}

// ── 2. No route may declare dynamicParams = true ────────────────────────────
const ROUTE_FILES = [
  'app/names/[religion]/[slug]/page.jsx',
  'app/names/[religion]/page.jsx',
  'app/names/[religion]/letter/[letter]/page.jsx',
  'app/[genderHub]/page.jsx',
  'app/blog/[slug]/page.jsx',
  'app/categories/[category]/page.jsx',
  'app/origins/[origin]/page.jsx',
];

for (const rel of ROUTE_FILES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  if (/export\s+const\s+dynamicParams\s*=\s*true/.test(src)) {
    fail(`${rel} declares dynamicParams = true — unknown paths would render on demand`);
  }
}

// ── 3. Every indexable record must have a prerendered HTML file ─────────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function hasPrerenderedHtml(religion, slug) {
  const candidates = [
    path.join(APP_DIR, 'names', religion, `${slug}.html`),
    path.join(APP_DIR, 'names', religion, slug, 'index.html'),
  ];
  return candidates.some((c) => fs.existsSync(c));
}

let indexable = 0;
let missing = 0;
const missingSample = [];

for (const rel of Object.keys(manifest)) {
  for (const item of manifest[rel] || []) {
    if (!item.indexable) continue;
    indexable++;
    if (!hasPrerenderedHtml(rel, item.slug)) {
      missing++;
      if (missingSample.length < 10) missingSample.push(`${rel}/${item.slug}`);
    }
  }
}

notes.push(`indexable records: ${indexable}`);
notes.push(`indexable records with prerendered HTML: ${indexable - missing}`);

if (missing > 0) {
  fail(
    `${missing} indexable record(s) have no prerendered HTML and would render on demand. ` +
      `Examples: ${missingSample.join(', ')}`
  );
}

// ── 4. Sitemap must not publish URLs without a prerendered page ─────────────
// The sitemap route filters on `item.indexable`, which is the same flag checked
// above, so a mismatch here means the two have drifted apart.
const sitemapRoute = path.join(ROOT, 'app', 'sitemap', '[id]', 'route.js');
if (fs.existsSync(sitemapRoute)) {
  const src = fs.readFileSync(sitemapRoute, 'utf8');
  if (!/item\.indexable/.test(src)) {
    fail('sitemap/[id]/route.js does not filter on item.indexable — it may publish thin URLs');
  }
}

// ── 5. Built sitemaps: unique URLs, each backed by a prerendered page ───────
// Reads the sitemap bodies Next.js prerendered (route handlers with
// generateStaticParams are written as <id>.xml.body files). Fails on:
//   • a URL listed more than once across all child sitemaps (/unique-baby-names
//     used to appear twice in pages.xml);
//   • a URL whose page was not prerendered (it would 404 or render on demand);
//   • a sitemap index that does not advertise the blog sitemap.
const SITEMAP_DIR = path.join(APP_DIR, 'sitemap');
const INDEX_BODY = path.join(APP_DIR, 'sitemap.xml.body');

function htmlExistsFor(urlPath) {
  const clean = urlPath.replace(/\/+$/, '') || '/';
  if (clean === '/') return fs.existsSync(path.join(APP_DIR, 'index.html'));
  const variants = new Set([clean, decodeURIComponent(clean)]);
  for (const v of variants) {
    if (fs.existsSync(path.join(APP_DIR, `${v}.html`))) return true;
    if (fs.existsSync(path.join(APP_DIR, v, 'index.html'))) return true;
  }
  return false;
}

if (fs.existsSync(SITEMAP_DIR)) {
  const bodies = fs.readdirSync(SITEMAP_DIR).filter((f) => f.endsWith('.xml.body'));
  const seen = new Map();
  const duplicates = [];
  const missingPages = [];
  let total = 0;
  for (const file of bodies) {
    const xml = fs.readFileSync(path.join(SITEMAP_DIR, file), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      total += 1;
      const loc = m[1].replace(/&amp;/g, '&');
      if (seen.has(loc)) duplicates.push(`${loc} (${seen.get(loc)} and ${file})`);
      else seen.set(loc, file);
      const urlPath = loc.replace(/^https?:\/\/[^/]+/, '');
      if (!htmlExistsFor(urlPath)) missingPages.push(urlPath);
    }
  }
  notes.push(`sitemap files: ${bodies.length} · sitemap URLs: ${total} · unique: ${seen.size}`);
  if (duplicates.length) fail(`${duplicates.length} duplicate sitemap URL(s): ${duplicates.slice(0, 5).join('; ')}`);
  if (missingPages.length) {
    fail(`${missingPages.length} sitemap URL(s) have no prerendered page: ${missingPages.slice(0, 10).join(', ')}`);
  }
  if (!bodies.includes('blog.xml.body')) fail('blog sitemap (/sitemap/blog.xml) was not generated');
  if (fs.existsSync(INDEX_BODY)) {
    const index = fs.readFileSync(INDEX_BODY, 'utf8');
    if (!/\/sitemap\/blog\.xml<\/loc>/.test(index)) fail('sitemap index does not list /sitemap/blog.xml');
  }
} else {
  notes.push('sitemap bodies not found under .next/server/app/sitemap — skipped sitemap URL checks');
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log('\nSTATIC-OUTPUT SAFETY GATE');
console.log('─'.repeat(64));
for (const n of notes) console.log(`  ${n}`);

if (failures.length) {
  console.log('');
  for (const f of failures) console.log(`  FAIL  ${f}`);
  console.log(`\n${failures.length} CHECK(S) FAILED — the build would burn Fluid Active CPU.`);
  process.exit(1);
}

console.log('\n  PASS  no dynamic routes, no dynamicParams=true, all indexable pages prerendered, sitemaps clean');
console.log('─'.repeat(64));
