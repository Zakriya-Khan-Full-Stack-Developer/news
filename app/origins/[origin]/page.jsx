import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManifest } from '../../../lib/data/names-data.js';
import { ORIGIN_SLUGS, ORIGIN_LABELS, originSlugFor, religionLabel } from '../../../lib/data/name-utils.js';
import NameCard from '../../../components/NameCard.jsx';
import { sampleEvenly } from '../../../lib/data/us-names.js';
import { pageMetadata } from '../../../lib/seo.js';
import AdSlot from '../../../components/AdSlot.jsx';

export const dynamicParams = false;

// Fix 2 — prerender all curated origin hubs at build time.
export function generateStaticParams() {
  const manifest = getManifest();
  return ORIGIN_SLUGS
    .filter((origin) =>
      Object.values(manifest).some((items) =>
        (items || []).some((item) => item.indexable && originSlugFor(item.origin) === origin),
      ),
    )
    .map((origin) => ({ origin }));
}

export async function generateMetadata({ params }) {
  const origin = params.origin;
  if (!ORIGIN_SLUGS.includes(origin)) return {};
  const label = ORIGIN_LABELS[origin] || origin.charAt(0).toUpperCase() + origin.slice(1);

  return pageMetadata({
    title: `${label} Baby Names with Meanings & Origins`,
    description: `Browse ${label} baby names with recorded meanings, origins and gender across Islamic, Christian and Hindu traditions, listed A\u2013Z.`,
    path: `/origins/${origin}`,
  });
}

export default function OriginDetailPage({ params }) {
  const origin = params.origin;
  if (!ORIGIN_SLUGS.includes(origin)) notFound();

  const label = ORIGIN_LABELS[origin] || origin.charAt(0).toUpperCase() + origin.slice(1);
  const canonicalUrl = `https://nameverse.site/origins/${origin}`;

  const manifest = getManifest();
  const all = [];
  const religionCounts = new Map();

  for (const rel of ['islamic', 'christian', 'hindu', 'italian']) {
    for (const item of manifest[rel] || []) {
      if (item.indexable && originSlugFor(item.origin) === origin) {
        all.push({ ...item, religion: rel });
        religionCounts.set(rel, (religionCounts.get(rel) || 0) + 1);
      }
    }
  }

  if (!all.length) notFound();
  // Even A–Z sample — no popularity ordering (the score is undocumented and
  // absent from every Islamic record).
  const topNames = sampleEvenly(all, 300);
  const religionsWithNames = [...religionCounts.entries()].sort((a, b) => b[1] - a[1]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} Baby Names`,
    description: `${all.length.toLocaleString()} ${label} baby names with meanings and origins.`,
    url: canonicalUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nameverse.site' },
      { '@type': 'ListItem', position: 2, name: 'Origins', item: 'https://nameverse.site/origins' },
      { '@type': 'ListItem', position: 3, name: `${label} Names` },
    ],
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-nv-text-secondary" aria-label="Breadcrumb">
          <Link href="/" className="font-medium hover:text-nv-accent transition">Home</Link>
          <span>/</span>
          <Link href="/origins" className="font-medium hover:text-nv-accent transition">Origins</Link>
          <span>/</span>
          <span className="font-medium text-nv-text">{label} names</span>
        </nav>

        <header className="mb-8 text-center">
          <span className="badge bg-nv-accent-subtle text-nv-accent">{all.length.toLocaleString()} {label} names</span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {label} Baby Names &amp; Meanings
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nv-text-secondary">
            {all.length.toLocaleString()} names whose records give {label} as their origin.
            {all.length > 300 ? ' Below is an even sample of 300 across the alphabet, listed A\u2013Z.' : ' Listed A\u2013Z.'}
            {origin === 'biblical' || origin === 'hindu'
              ? ` \u201c${label}\u201d is a tradition label carried in the source records rather than a language, so check each profile for the underlying language.`
              : ''}
          </p>

          {religionsWithNames.length > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {religionsWithNames.map(([rel, count]) => (
                <Link
                  key={rel}
                  href={`/names/${rel}`}
                  className="rounded-full border border-nv-border bg-nv-surface px-3 py-1 text-xs font-semibold text-nv-text hover:border-nv-accent hover:text-nv-accent transition"
                >
                  {religionLabel(rel)} ({count.toLocaleString()})
                </Link>
              ))}
            </div>
          )}
        </header>

        <AdSlot placement="origin-top" />

        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topNames.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>

        {all.length > 300 && (
          <p className="mt-10 text-center text-sm text-nv-text-secondary">
            Showing 300 of {all.length.toLocaleString()}, spread evenly across the alphabet.{' '}
            <Link href={`/search?origin=${origin}`} className="font-semibold text-nv-accent hover:underline">
              Search the full list &rarr;
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
