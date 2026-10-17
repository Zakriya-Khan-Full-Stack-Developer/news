import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManifest } from '@/lib/data/names-data.js';
import { normalizeGender, genderLabel, religionLabel } from '@/lib/data/name-utils.js';
import { sampleEvenly } from '@/lib/data/us-names.js';
import { pageMetadata } from '@/lib/seo.js';
import NameCard from '@/components/NameCard.jsx';
import AdSlot from '@/components/AdSlot.jsx';

export const dynamicParams = false;

const VALID_HUBS = {
  'islamic-boy-names': { religion: 'islamic', gender: 'boy' },
  'islamic-girl-names': { religion: 'islamic', gender: 'girl' },
  'christian-boy-names': { religion: 'christian', gender: 'boy' },
  'christian-girl-names': { religion: 'christian', gender: 'girl' },
  'hindu-boy-names': { religion: 'hindu', gender: 'boy' },
  'hindu-girl-names': { religion: 'hindu', gender: 'girl' },
  'italian-boy-names': { religion: 'italian', gender: 'boy' },
  'italian-girl-names': { religion: 'italian', gender: 'girl' },
};

// Fix 2 — prerender all eight gender hubs at build time.
export function generateStaticParams() {
  const manifest = getManifest();
  return Object.entries(VALID_HUBS)
    .filter(([, config]) =>
      (manifest[config.religion] || []).some(
        (item) => item.indexable && normalizeGender(item.gender) === config.gender,
      ),
    )
    .map(([genderHub]) => ({ genderHub }));
}

export async function generateMetadata({ params }) {
  const config = VALID_HUBS[params.genderHub];
  if (!config) return {};

  const { religion, gender } = config;
  const relLabel = religionLabel(religion);
  const genLabel = genderLabel(gender);
  const manifest = getManifest();
  const allItems = manifest[religion] || [];
  const items = allItems.filter(
    (item) => item.indexable && normalizeGender(item.gender) === gender,
  );
  if (!items.length) return { robots: { index: false, follow: true } };

  return pageMetadata({
    title: `${genLabel} ${relLabel} Baby Names & Meanings (${items.length.toLocaleString()})`,
    description: `Browse ${items.length.toLocaleString()} ${relLabel.toLowerCase()} ${gender} baby names with recorded meanings and origins, A\u2013Z, with pronunciation and script forms where available.`,
    path: `/${params.genderHub}`,
  });
}

export default function GenderHubPage({ params }) {
  const config = VALID_HUBS[params.genderHub];
  if (!config) notFound();

  const { religion, gender } = config;
  const relLabel = religionLabel(religion);
  const genLabel = genderLabel(gender);
  const canonicalUrl = `https://nameverse.site/${params.genderHub}`;

  const manifest = getManifest();
  const allItems = manifest[religion] || [];
  const items = allItems.filter((item) => item.indexable && normalizeGender(item.gender) === gender);
  if (!items.length) notFound();

  // No popularity ordering: Islamic records carry no score at all, and the
  // Christian/Hindu score is undocumented. Show an even sample across the
  // alphabet, listed A–Z, and send readers to search for the full set.
  const topNames = sampleEvenly(items, 300);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${genLabel} ${relLabel} Baby Names`,
    description: `${items.length.toLocaleString()} ${relLabel.toLowerCase()} ${gender} names with meanings and origins.`,
    url: canonicalUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nameverse.site' },
      { '@type': 'ListItem', position: 2, name: `${relLabel} Names`, item: `https://nameverse.site/names/${religion}` },
      { '@type': 'ListItem', position: 3, name: `${genLabel} Names` },
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
          <Link href={`/names/${religion}`} className="font-medium hover:text-nv-accent transition">{relLabel} Names</Link>
          <span>/</span>
          <span className="font-medium text-nv-text">{genLabel} names</span>
        </nav>

        <header className="mb-8 text-center">
          <span className="badge bg-nv-accent-subtle text-nv-accent">
            {items.length.toLocaleString()} {gender} names
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {genLabel} {relLabel} Names &amp; Meanings
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nv-text-secondary">
            {items.length.toLocaleString()} {relLabel.toLowerCase()} {gender} names, each with a recorded meaning
            and origin. Listed A&ndash;Z &mdash; this is a browsing list, not a popularity ranking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href={`/search?religion=${religion}&gender=${gender}`} className="btn-primary">
              Search all {items.length.toLocaleString()} names
            </Link>
            <Link href={`/names/${religion}`} className="btn-ghost">
              Browse all {relLabel.toLowerCase()} names
            </Link>
            <Link href={`/${religion}-${gender === 'boy' ? 'girl' : 'boy'}-names`} className="btn-ghost">
              Switch to {genLabel === 'Boy' ? 'Girl' : 'Boy'} names
            </Link>
          </div>
        </header>

        <AdSlot placement="gender-hub-top" />

        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topNames.map((item) => (
            <NameCard key={item.slug} item={{ ...item, religion }} />
          ))}
        </div>

        {items.length > 300 && (
          <p className="mt-10 text-center text-sm text-nv-text-secondary">
            Showing 300 of {items.length.toLocaleString()}, spread evenly across the alphabet.{' '}
            <Link
              href={`/search?religion=${religion}&gender=${gender}`}
              className="font-semibold text-nv-accent hover:underline"
            >
              Search the full list &rarr;
            </Link>
          </p>
        )}

        <section className="mx-auto mt-16 max-w-3xl border-t border-nv-border pt-10" aria-labelledby="seo-heading">
          <h2 id="seo-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Choosing a {relLabel.toLowerCase()} {gender} name
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            <p>
              A {relLabel.toLowerCase()} {gender} name should feel meaningful to your family, sound
              natural with your surname, and carry the qualities you hope your child will grow into.
              Start with meanings that speak to you, then check pronunciation and spelling with the
              people who will use the name every day.
            </p>
            <p>
              Once you find a few you like, save them to your shortlist from each profile, then compare
              meanings, origins and spellings side by side on the comparison page.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

