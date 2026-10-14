import { getManifest } from '../../lib/data/names-data.js';

export async function GET() {
  const siteUrl = 'https://nameverse.site';
  const manifest = getManifest();

  const chunkSize = 5000;
  const sitemaps = [
    { loc: `${siteUrl}/sitemap/pages.xml` },
  ];

  for (const rel of ['islamic', 'christian', 'hindu', 'italian']) {
    // Count only records that will actually be published. Counting every record
    // would emit sitemap chunks for pages that are never prerendered, and a
    // crawler following those would hit 404s (or, before the Fluid Active CPU
    // fix, trigger on-demand renders).
    //
    // FIX — a tradition with ZERO indexable records must not be advertised at
    // all. `Math.ceil(0 / 5000) || 1` evaluates to 1, so the Italian set (all
    // 352 records are empty stubs) still emitted <loc>/sitemap/italian.xml</loc>
    // here, while app/sitemap/[id]/route.js returned HTTP 404 for it because it
    // had no URLs to print. The live index therefore advertised a child sitemap
    // that does not exist, and Google Search Console reports the whole index as
    // "Sitemap could not be read" — which suppresses discovery of the other
    // 12,563 URLs in it.
    const count = (manifest[rel] || []).filter((i) => i.indexable).length;
    if (count === 0) continue;
    const chunks = Math.ceil(count / chunkSize) || 1;
    if (chunks === 1) {
      sitemaps.push({ loc: `${siteUrl}/sitemap/${rel}.xml` });
    } else {
      for (let i = 1; i <= chunks; i++) {
        sitemaps.push({ loc: `${siteUrl}/sitemap/${rel}-${i}.xml` });
      }
    }
  }

  // FIX — no <lastmod> on the index entries. Every entry previously carried
  // `new Date().toISOString()`, i.e. the build timestamp, so on every single
  // deploy all five child sitemaps claimed to have been modified at the same
  // instant even when not one record had changed. Google discounts a lastmod it
  // can see is synthetic, and a sitemap index that rewrites itself on every
  // deploy gives the crawler no stable signal to schedule against. Sitemaps
  // Protocol makes lastmod optional; omitting an honest value beats shipping a
  // fabricated one.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
    },
  });
}
