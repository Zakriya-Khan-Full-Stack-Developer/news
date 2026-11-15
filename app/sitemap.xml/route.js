import { getManifest } from '../../lib/data/names-data.js';

// The index depends only on the committed build manifest; generate it at build time.
export const dynamic = 'force-static';

export async function GET() {
  const siteUrl = 'https://nameverse.site';
  const manifest = getManifest();
  const chunkSize = 5000;
  const sitemaps = [
    { loc: `${siteUrl}/sitemap/pages.xml` },
    { loc: `${siteUrl}/sitemap/blog.xml` },
  ];

  for (const rel of ['islamic', 'christian', 'hindu', 'italian']) {
    const count = (manifest[rel] || []).filter((item) => item.indexable).length;
    if (count === 0) continue;
    const chunks = Math.ceil(count / chunkSize);
    if (chunks === 1) {
      sitemaps.push({ loc: `${siteUrl}/sitemap/${rel}.xml` });
    } else {
      for (let i = 1; i <= chunks; i += 1) sitemaps.push({ loc: `${siteUrl}/sitemap/${rel}-${i}.xml` });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
