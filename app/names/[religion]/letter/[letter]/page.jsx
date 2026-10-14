import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManifest, normalizeReligion } from '../../../../../lib/data/names-data.js';
import {
  ALL_RELIGIONS,
  ALL_LETTERS,
  LETTER_PAGE_SIZE,
  letterPageCount,
  lettersFor,
  namesForLetter,
  parseLetterParam,
} from '../../../../../lib/data/letter-browser.js';
import { isBoy, isGirl, religionLabel } from '../../../../../lib/data/name-utils.js';
import AlphabetNav from '../../../../../components/AlphabetNav.jsx';
import NameCard from '../../../../../components/NameCard.jsx';
import LetterPagination from '../../../../../components/LetterPagination.jsx';
import AdSlot from '../../../../../components/AdSlot.jsx';

// FIX — Fluid Active CPU: every letter hub that has names is prerendered by
// generateStaticParams below, so no unknown letter can fall through to an
// on-demand render.
export const dynamicParams = false;

// Fix 2 — prerender every letter hub that actually has names.
export function generateStaticParams() {
  const manifest = getManifest();
  const params = [];
  for (const religion of ALL_RELIGIONS) {
    const available = lettersFor(religion, manifest);
    for (const letter of ALL_LETTERS) {
      if (available.has(letter)) {
        // FIX — do NOT pre-encode the '#' as '%23' here. Next.js percent-encodes
        // the param value itself when it writes the prerendered path, so
        // passing the string '%23' produced encodeURIComponent('%23') === '%2523'
        // and the file landed on disk as `/names/christian/letter/%2523.html`.
        // Every link — and the sitemap — points at `/names/christian/letter/%23`,
        // so that one URL was a guaranteed 404 sitting inside the sitemap.
        // Pass the raw letter and let the framework do the encoding once.
        params.push({ religion, letter });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const finalReligion = normalizeReligion(params.religion);
  if (!finalReligion) return {};
  const letter = parseLetterParam(params.letter);
  const relLabel = religionLabel(finalReligion);
  const letterDisplay = letter === '#' ? 'Other / Special' : letter.toUpperCase();
  const letterUrlSegment = letter === '#' ? '%23' : letter;

  const manifest = getManifest();
  const count = namesForLetter(finalReligion, letter, manifest).length;

  return {
    title: `"${letterDisplay}" ${relLabel} Baby Names & Meanings (${count})`,
    description: `Browse ${count} ${relLabel} baby names starting with "${letterDisplay}" — documented meanings, origins, gender and lucky numbers. Free A–Z browsing.`,
    alternates: {
      canonical: `https://nameverse.site/names/${finalReligion}/letter/${letterUrlSegment}`,
    },
  };
}

export default function LetterBrowsePage({ params }) {
  const finalReligion = normalizeReligion(params.religion);
  if (!finalReligion) notFound();

  const letter = parseLetterParam(params.letter);
  const relLabel = religionLabel(finalReligion);
  const letterDisplay = letter === '#' ? 'Other / Special' : letter.toUpperCase();
  const letterUrlSegment = letter === '#' ? '%23' : letter;
  const canonicalUrl = `https://nameverse.site/names/${finalReligion}/letter/${letterUrlSegment}`;

  const manifest = getManifest();
  const availableLetters = lettersFor(finalReligion, manifest);

  const names = namesForLetter(finalReligion, letter, manifest);

  if (names.length === 0 && !availableLetters.has(letter)) {
    notFound();
  }

  // Page 1 of the hub. The 300-per-page cap stays — a single page holding all
  // 975 "a" names was heavy enough to crash mobile browsers — but instead of
  // truncating and orphaning the rest, the remainder now lives on
  // /page/2 … /page/N and is linked from the pager below.
  const pageCount = letterPageCount(finalReligion, letter, manifest);
  const topNames = names.slice(0, LETTER_PAGE_SIZE);
  const boyCount = names.filter(isBoy).length;
  const girlCount = names.filter(isGirl).length;

  const switcherReligions = ALL_RELIGIONS.filter((r) => lettersFor(r, manifest).has(letter));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${relLabel} Baby Names Starting with "${letterDisplay}"`,
    description: `${names.length} ${relLabel} baby names beginning with "${letterDisplay}", each with meaning, origin and cultural context.`,
    url: canonicalUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nameverse.site' },
      { '@type': 'ListItem', position: 2, name: `${relLabel} Names`, item: `https://nameverse.site/names/${finalReligion}` },
      { '@type': 'ListItem', position: 3, name: `Letter ${letterDisplay}` },
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
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-nv-text-secondary" aria-label="Breadcrumb">
          <Link href="/" className="font-medium hover:text-nv-accent transition">Home</Link>
          <span>/</span>
          <Link href={`/names/${finalReligion}`} className="font-medium hover:text-nv-accent transition">{relLabel} Names</Link>
          <span>/</span>
          <span className="font-medium text-nv-text">Letter {letterDisplay}</span>
        </nav>

        {/* Hero */}
        <header className="mb-8 text-center">
          <span className="badge bg-nv-accent-subtle text-nv-accent">
            {names.length.toLocaleString()} names &bull; {boyCount.toLocaleString()} boys &bull; {girlCount.toLocaleString()} girls
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {relLabel} Names Starting with &ldquo;{letterDisplay}&rdquo;
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-nv-text-secondary">
            Authentic {relLabel.toLowerCase()} baby names beginning with <strong>{letterDisplay}</strong> —
            with meanings, origins and lucky numbers.
          </p>
        </header>

        <AdSlot placement="letter-hub-top" />

        {/* Alphabet Navigator */}
        <div className="mb-8">
          <AlphabetNav
            religion={finalReligion}
            currentLetter={letter}
            availableLetters={availableLetters}
          />
        </div>

        {/* Tradition Switcher */}
        {switcherReligions.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-semibold text-nv-text-secondary mr-1">Other traditions for letter {letterDisplay}:</span>
            {switcherReligions
              .filter((r) => r !== finalReligion)
              .map((r) => (
                <Link
                  key={r}
                  href={`/names/${r}/letter/${letterUrlSegment}`}
                  className="rounded-full border border-nv-border bg-nv-surface px-3 py-1 text-xs font-semibold text-nv-text hover:border-nv-accent hover:text-nv-accent transition capitalize"
                >
                  {religionLabel(r)} names &rarr;
                </Link>
              ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topNames.map((item) => (
            <NameCard key={item.slug} item={{ ...item, religion: finalReligion }} />
          ))}
        </div>

        <LetterPagination
          religion={finalReligion}
          letter={letter}
          currentPage={1}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
