import { getManifest, getBlogPosts } from '../../../lib/data/names-data.js';
import { ORIGIN_SLUGS, CATEGORY_SLUGS, categorySlugFor, originSlugFor } from '../../../lib/data/name-utils.js';
import { ALL_LETTERS, lettersFor, letterPageCount } from '../../../lib/data/letter-browser.js';

// Prerender every sitemap chunk at build time so this route is static (○),
// not server-rendered on demand (ƒ). Without this, each crawler hit on a
// sitemap URL burns a Function Invocation + Active CPU.
export function generateStaticParams() {
  const manifest = getManifest();
  const chunkSize = 5000;
  const ids = ['pages'];

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

export async function GET(request, { params }) {
  const siteUrl = 'https://nameverse.site';
  const manifest = getManifest();
  const id = params.id.replace(/\.xml$/, '');

  let urls = [];

  if (id === 'pages') {
    // Core pages
    urls.push(`${siteUrl}/`);
    urls.push(`${siteUrl}/names`);
    urls.push(`${siteUrl}/origins`);
    urls.push(`${siteUrl}/categories`);
    urls.push(`${siteUrl}/blog`);
    urls.push(`${siteUrl}/about`);
    urls.push(`${siteUrl}/contact`);
    urls.push(`${siteUrl}/trending-names`);
    // FIX — was `/unique-names`, which next.config.js permanently redirects
    // (308) to /unique-baby-names. A URL that redirects has no place in a
    // sitemap: GSC flags it as "Sitemap contains URLs which redirect", and the
    // crawler has to spend a second fetch to find the real destination.
    urls.push(`${siteUrl}/unique-baby-names`);
    urls.push(`${siteUrl}/popularity`);
    urls.push(`${siteUrl}/name-meanings`);
    urls.push(`${siteUrl}/names-by-meaning`);
    urls.push(`${siteUrl}/names-by-origin`);

    // US (Tier 1) search-demand pages. These are the highest-value commercial
    // and informational targets, so they are listed explicitly rather than
    // being left to discovery.
    urls.push(`${siteUrl}/popular-names-2026`);
    urls.push(`${siteUrl}/top-baby-names-2026`);
    urls.push(`${siteUrl}/unique-baby-names`);
    urls.push(`${siteUrl}/gender-neutral-names`);
    urls.push(`${siteUrl}/baby-names-by-state`);
    urls.push(`${siteUrl}/vintage-baby-names`);
    urls.push(`${siteUrl}/biblical-baby-names`);
    urls.push(`${siteUrl}/muslim-baby-names-america`);
    urls.push(`${siteUrl}/nature-baby-names`);
    urls.push(`${siteUrl}/short-baby-names`);
    urls.push(`${siteUrl}/editorial-policy`);

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
      urls.push(`${siteUrl}/names/${rel}`);
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
      urls.push(`${siteUrl}/${gh}`);
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
      urls.push(`${siteUrl}/origins/${o}`);
    }

    // Category hubs
    for (const c of CATEGORY_SLUGS) {
      if (publishableCount((i) => categorySlugFor(i.category) === c) === 0) continue;
      urls.push(`${siteUrl}/categories/${c}`);
    }

    // Letter browse hubs — plus every paginated continuation. The hub used to
    // cap at 300 names, so anything past that had no crawlable path at all;
    // listing pages 2..N here is what gives those ~2,700 name pages a route in.
    for (const rel of publishableReligions) {
      const avail = lettersFor(rel, manifest);
      for (const letter of ALL_LETTERS) {
        if (!avail.has(letter)) continue;
        const segment = letter === '#' ? '%23' : letter;
        urls.push(`${siteUrl}/names/${rel}/letter/${segment}`);
        const pageCount = letterPageCount(rel, letter, manifest);
        for (let page = 2; page <= pageCount; page += 1) {
          urls.push(`${siteUrl}/names/${rel}/letter/${segment}/page/${page}`);
        }
      }
    }

    // Blog posts
    const blogPosts = getBlogPosts();
    for (const post of blogPosts) {
      if (post.id) {
        urls.push(`${siteUrl}/blog/${post.id}`);
      }
    }
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
      urls.push(`${siteUrl}/names/${religion}/${item.slug}`);
    }
  }

  if (urls.length === 0) {
    return new Response('Sitemap not found', { status: 404 });
  }

  // FIX — no <lastmod>. Every URL previously carried `new Date().toISOString()`,
  // so all ~12,500 URLs claimed to be modified at the exact same second on
  // every deploy, regardless of whether the underlying record changed. That is
  // the canonical example of a lastmod Google learns to ignore, and it gave the
  // crawler no way to prioritise: with everything "new" on every deploy,
  // nothing is. On a domain that is new and therefore crawl-budget-limited,
  // that alone can stall indexing for months. lastmod is optional in the
  // Sitemaps Protocol; when it cannot be guaranteed accurate it must be omitted.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
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
