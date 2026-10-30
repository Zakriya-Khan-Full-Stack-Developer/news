import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getManifest,
  normalizeReligion,
} from '@/lib/data/names-data.js';
import {
  ALL_RELIGIONS,
  ALL_LETTERS,
  LETTER_PAGE_SIZE,
  letterPageCount,
  letterUrlSegment,
  lettersFor,
  namesForLetter,
  parseLetterParam,
} from '@/lib/data/letter-browser.js';
import { isBoy, isGirl, religionLabel } from '@/lib/data/name-utils.js';
import AlphabetNav from '@/components/AlphabetNav.jsx';
import NameCard from '@/components/NameCard.jsx';
import LetterPagination from '@/components/LetterPagination.jsx';
import AdSlot from '@/components/AdSlot.jsx';
import { pageMetadata } from '@/lib/seo.js';

export const dynamicParams = false;

/**
 * Prerender pages 2..N only. Page 1 stays at /names/[religion]/letter/[letter]
 * so the existing, already-indexed URL keeps working untouched.
 */
export function generateStaticParams() {
  const manifest = getManifest();
  const params = [];
  for (const religion of ALL_RELIGIONS) {
    const available = lettersFor(religion, manifest);
    for (const letter of ALL_LETTERS) {
      if (!available.has(letter)) continue;
      const pageCount = letterPageCount(religion, letter, manifest);
      for (let page = 2; page <= pageCount; page += 1) {
        params.push({ religion, letter, page: String(page) });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const finalReligion = normalizeReligion(params.religion);
  if (!finalReligion) return {};
  const letter = parseLetterParam(params.letter);
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) return {};

  const manifest = getManifest();
  const names = namesForLetter(finalReligion, letter, manifest);
  const pageCount = letterPageCount(finalReligion, letter, manifest);
  if (page > pageCount) return {};

  const relLabel = religionLabel(finalReligion);
  const letterDisplay = letter === '#' ? 'Other / Special' : letter.toUpperCase();
  const segment = letterUrlSegment(letter);

  return pageMetadata({
    title: `"${letterDisplay}" ${relLabel} Baby Names — Page ${page} of ${pageCount}`,
    description: `${relLabel} baby names starting with "${letterDisplay}", page ${page} of ${pageCount} (${names.length.toLocaleString()} names) — documented meanings, origins, gender and lucky numbers.`,
    path: `/names/${finalReligion}/letter/${segment}/page/${page}`,
  });
}

export default function LetterBrowsePagedPage({ params }) {
  const finalReligion = normalizeReligion(params.religion);
  if (!finalReligion) notFound();

  const letter = parseLetterParam(params.letter);
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) notFound();

  const manifest = getManifest();
  const names = namesForLetter(finalReligion, letter, manifest);
  const pageCount = letterPageCount(finalReligion, letter, manifest);
  if (page > pageCount) notFound();

  const relLabel = religionLabel(finalReligion);
  const letterDisplay = letter === '#' ? 'Other / Special' : letter.toUpperCase();
  const segment = letterUrlSegment(letter);
  const availableLetters = lettersFor(finalReligion, manifest);

  const start = (page - 1) * LETTER_PAGE_SIZE;
  const pageNames = names.slice(start, start + LETTER_PAGE_SIZE);
  const boyCount = names.filter(isBoy).length;
  const girlCount = names.filter(isGirl).length;
  const switcherReligions = ALL_RELIGIONS.filter((r) => lettersFor(r, manifest).has(letter));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${relLabel} Baby Names Starting with "${letterDisplay}" — Page ${page}`,
    description: `${names.length} ${relLabel} baby names beginning with "${letterDisplay}", each with meaning, origin and cultural context.`,
    url: `https://nameverse.site/names/${finalReligion}/letter/${segment}/page/${page}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nameverse.site' },
      { '@type': 'ListItem', position: 2, name: `${relLabel} Names`, item: `https://nameverse.site/names/${finalReligion}` },
      { '@type': 'ListItem', position: 3, name: `Letter ${letterDisplay}`, item: `https://nameverse.site/names/${finalReligion}/letter/${segment}` },
      { '@type': 'ListItem', position: 4, name: `Page ${page}` },
    ],
  };

  return (
    <div className="container-page py-8 sm:py-12">
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
          <Link href={`/names/${finalReligion}`} className="font-medium hover:text-nv-accent transition">{relLabel} Names</Link>
          <span>/</span>
          <Link href={`/names/${finalReligion}/letter/${segment}`} className="font-medium hover:text-nv-accent transition">Letter {letterDisplay}</Link>
          <span>/</span>
          <span className="font-medium text-nv-text">Page {page}</span>
        </nav>

        <header className="mb-8 text-center">
          <span className="badge bg-nv-accent-subtle text-nv-accent">
            {names.length.toLocaleString()} names &bull; {boyCount.toLocaleString()} boys &bull; {girlCount.toLocaleString()} girls
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {relLabel} Names Starting with &ldquo;{letterDisplay}&rdquo; &mdash; Page {page}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-nv-text-secondary">
            Names {start + 1}&ndash;{Math.min(start + LETTER_PAGE_SIZE, names.length)} of{' '}
            {names.length.toLocaleString()} {relLabel.toLowerCase()} baby names beginning with{' '}
            <strong>{letterDisplay}</strong>.
          </p>
        </header>

        <AdSlot placement="letter-hub-top" />

        <div className="mb-8">
          <AlphabetNav
            religion={finalReligion}
            currentLetter={letter}
            availableLetters={availableLetters}
          />
        </div>

        {switcherReligions.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-semibold text-nv-text-secondary mr-1">Other traditions for letter {letterDisplay}:</span>
            {switcherReligions
              .filter((r) => r !== finalReligion)
              .map((r) => (
                <Link
                  key={r}
                  href={`/names/${r}/letter/${segment}`}
                  className="rounded-full border border-nv-border bg-nv-surface px-3 py-1 text-xs font-semibold text-nv-text hover:border-nv-accent hover:text-nv-accent transition capitalize"
                >
                  {religionLabel(r)} names &rarr;
                </Link>
              ))}
          </div>
        )}

        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageNames.map((item) => (
            <NameCard key={item.slug} item={{ ...item, religion: finalReligion }} />
          ))}
        </div>

        <LetterPagination
          religion={finalReligion}
          letter={letter}
          currentPage={page}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
