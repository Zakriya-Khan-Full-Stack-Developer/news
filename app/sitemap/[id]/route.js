import { getManifest } from '../../../lib/data/names-data.js';
import { getPublishedPosts } from '../../../lib/data/blog.js';
import { ORIGIN_SLUGS, CATEGORY_SLUGS, categorySlugFor, originSlugFor } from '../../../lib/data/name-utils.js';
import { ALL_LETTERS, lettersFor, letterPageCount } from '../../../lib/data/letter-browser.js';

// Prerender every sitemap chunk at build time so this route is static (○),
// not server-rendered on demand (ƒ). Without this, each crawler hit on a
// sitemap URL burns a Function Invocation + Active CPU.
export function generateStaticParams() {
  const manifest = getManifest();
  const chunkSize = 5000;
  // `blog` is a dedicated child sitemap for the articles in
  // public/data/blog-posts.json, with an honest per-post <lastmod>.
  const ids = ['pages', 'blog'];

  for (const rel of ['islamic', 'christian', 'hindu', 'italian']) {
    const count = (manifest[rel] || []).filter((i) => i.indexable).length;
    // FIX — skip traditions with nothing to publish. Emitting `italian.xml` for
    // a set with zero indexable records produced a child sitemap that 404s,
    // while the sitemap index still advertised it.
    if (count === 0) continue;
    const chunks = Math.ceil(count / chunkSize) || 1;
    if (chunks === 1) {
      ids.push(rel);
    } else {
      for (let i = 1; i <= chunks; i++) ids.push(`${rel}-${i}`);
    }
  }

  return ids.map((id) => ({ id: `${id}.xml` }));
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Blog URLs carry a real <lastmod>: each article records the date it was last
// edited (`lastUpdated`), so unlike a build timestamp the value is accurate.
function isoDate(value) {
  const s = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

export async function GET(request, { params }) {
  const siteUrl = 'https://nameverse.site';
  const manifest = getManifest();
  const { id: rawId } = await params;
  const id = String(rawId).replace(/\.xml$/, '');

  // Entries are { loc, lastmod? }. A Map keyed by loc guarantees every URL is
  // listed exactly once — /unique-baby-names used to be pushed twice.
  const entries = new Map();
  const add = (loc, lastmod = null) => {
    if (!entries.has(loc)) entries.set(loc, { loc, lastmod });
  };

  if (id === 'blog') {
    const posts = getPublishedPosts();
    const newest = posts
      .map((p) => isoDate(p.lastUpdated || p.publishDate))
      .filter(Boolean)
      .sort()
      .pop();
    add(`${siteUrl}/blog`, newest || null);
    for (const post of posts) {
      add(`${siteUrl}/blog/${post.id}`, isoDate(post.lastUpdated || post.publishDate));
    }
  } else if (id === 'pages') {
    // Core pages
    add(`${siteUrl}/`);
    add(`${siteUrl}/names`);
    add(`${siteUrl}/origins`);
    add(`${siteUrl}/categories`);
    add(`${siteUrl}/about`);
    add(`${siteUrl}/contact`);
    add(`${siteUrl}/trending-names`);
    add(`${siteUrl}/popularity`);
    add(`${siteUrl}/name-meanings`);
    add(`${siteUrl}/names-by-meaning`);
    add(`${siteUrl}/names-by-origin`);

    // US (Tier 1) search-demand pages. These are the highest-value commercial
    // and informational targets, so they are listed explicitly rather than
    // being left to discovery. /popular-names-2026 is NOT listed: it now
    // 301-redirects to /top-baby-names-2026 (one page per search intent), and
    // a redirecting URL has no place in a sitemap. Likewise /unique-names
    // redirects to /unique-baby-names.
    add(`${siteUrl}/top-baby-names-2026`);
    add(`${siteUrl}/unique-baby-names`);
    add(`${siteUrl}/gender-neutral-names`);
    add(`${siteUrl}/baby-names-by-state`);
    add(`${siteUrl}/vintage-baby-names`);
    add(`${siteUrl}/biblical-baby-names`);
    add(`${siteUrl}/muslim-baby-names-america`);
    add(`${siteUrl}/nature-baby-names`);
    add(`${siteUrl}/short-baby-names`);
    add(`${siteUrl}/editorial-policy`);
    // /guides/expert-naming-guide now 301s to /blog/how-to-choose-a-baby-name,
    // which is listed in the blog sitemap.

    // FIX — the name-detail sitemaps below already skip a tradition with zero
    // indexable records, but the hub list did not. /names/italian ships 352
    // records and not one of them has content, so the sitemap was advertising a
    // page that reads "352 names · 0 boys · 0 girls" and whose every card is an
    // unlinkable "soon" stub. Only list hubs for traditions that publish
    // something.
    const publishableReligions = ['islamic', 'christian', 'hindu', 'italian'].filter(
      (rel) => (manifest[rel] || []).filter((i) => i.indexable).length > 0,
    );

    // Tradition hubs
    for (const rel of publishableReligions) {
      add(`${siteUrl}/names/${rel}`);
    }

    // Gender hubs
    const genderHubs = [
      'islamic-boy-names',
      'islamic-girl-names',
      'christian-boy-names',
      'christian-girl-names',
      'hindu-boy-names',
      'hindu-girl-names',
      'italian-boy-names',
      'italian-girl-names',
    ].filter((gh) => publishableReligions.some((rel) => gh.startsWith(rel)));
    for (const gh of genderHubs) {
      add(`${siteUrl}/${gh}`);
    }

    // Origin and category hubs. Same rule as the tradition hubs: a hub whose
    // every entry is a content-free stub has nothing for a visitor or a
    // crawler, so it does not belong in the sitemap. /categories/islamic
    // renders "0 names" and /origins/italian renders 352 names of which none is
    // linkable — both were being submitted as real pages.
    const publishableCount = (pred) =>
      ['islamic', 'christian', 'hindu', 'italian'].reduce(
        (sum, rel) => sum + (manifest[rel] || []).filter((i) => i.indexable && pred(i)).length,
        0,
      );

    // Origin hubs
    for (const o of ORIGIN_SLUGS) {
      if (publishableCount((i) => originSlugFor(i.origin) === o) === 0) continue;
      add(`${siteUrl}/origins/${o}`);
    }

    // Category hubs
    for (const c of CATEGORY_SLUGS) {
      if (publishableCount((i) => categorySlugFor(i.category) === c) === 0) continue;
      add(`${siteUrl}/categories/${c}`);
    }

    // Letter browse hubs — plus every paginated continuation. The hub used to
    // cap at 300 names, so anything past that had no crawlable path at all;
    // listing pages 2..N here is what gives those ~2,700 name pages a route in.
    for (const rel of publishableReligions) {
      const avail = lettersFor(rel, manifest);
      for (const letter of ALL_LETTERS) {
        if (!avail.has(letter)) continue;
        const segment = letter === '#' ? '%23' : letter;
        add(`${siteUrl}/names/${rel}/letter/${segment}`);
        const pageCount = letterPageCount(rel, letter, manifest);
        for (let page = 2; page <= pageCount; page += 1) {
          add(`${siteUrl}/names/${rel}/letter/${segment}/page/${page}`);
        }
      }
    }

    // Blog posts are published in their own child sitemap (/sitemap/blog.xml).
  } else {
    // Name detail sitemaps: e.g. islamic-1, islamic-2, or italian
    let religion = id;
    let chunkIndex = 1;

    const match = id.match(/^([a-z]+)-(\d+)$/);
    if (match) {
      religion = match[1];
      chunkIndex = parseInt(match[2], 10);
    }

    // Only publish URLs for pages that actually carry unique content. A record
    // whose meaning or origin is a negative assertion ("no confident lexical
    // sense is asserted") renders a near-duplicate of every other such record,
    // and submitting those to Google is what causes "Crawled — currently not
    // indexed" at scale. The `indexable` flag is computed once in
    // generate-manifest.mjs so this route, the detail page and the gates can
    // never disagree.
    const items = (manifest[religion] || []).filter((item) => item.slug && item.indexable);
    const chunkSize = 5000;
    const start = (chunkIndex - 1) * chunkSize;
    const chunkItems = items.slice(start, start + chunkSize);

    for (const item of chunkItems) {
      add(`${siteUrl}/names/${religion}/${item.slug}`);
    }
  }

  if (entries.size === 0) {
    return new Response('Sitemap not found', { status: 404 });
  }

  // <lastmod> policy: only emitted where the date is real (blog articles).
  // FIX — no <lastmod> elsewhere. Every URL previously carried `new Date().toISOString()`,
  // so all ~12,500 URLs claimed to be modified at the exact same second on
  // every deploy, regardless of whether the underlying record changed. That is
  // the canonical example of a lastmod Google learns to ignore, and it gave the
  // crawler no way to prioritise: with everything "new" on every deploy,
  // nothing is. On a domain that is new and therefore crawl-budget-limited,
  // that alone can stall indexing for months. lastmod is optional in the
  // Sitemaps Protocol; when it cannot be guaranteed accurate it must be omitted.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...entries.values()]
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `
    <lastmod>${e.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
    },
  });
}
