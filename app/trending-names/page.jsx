import Link from 'next/link';
import { getManifest } from '../../lib/data/names-data.js';
import { religionLabel } from '../../lib/data/name-utils.js';
import NameCard from '../../components/NameCard.jsx';
import AdSlot from '../../components/AdSlot.jsx';

export const metadata = {
  title: 'Trending Baby Names of 2026 — Highest Popularity Scores',
  description:
    'Discover high-scoring baby names in 2026 across Islamic, Christian and Hindu traditions — with documented meanings, origins and transparent popularity context.',
  alternates: {
    canonical: 'https://nameverse.site/trending-names',
  },
};

export default function TrendingNamesPage() {
  const manifest = getManifest();
  const all = [];
  for (const rel of ['islamic', 'christian', 'hindu']) {
    for (const item of manifest[rel] || []) {
      // Trending is an indexable discovery surface: exclude verification-
      // pending records and canonical aliases from the ranked list.
      if (item.slug && item.name && item.indexable) {
        all.push({ ...item, religion: rel });
      }
    }
  }
  all.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
  const trending = all.slice(0, 60);

  const byReligion = Object.fromEntries(
    ['islamic', 'christian', 'hindu'].map((rel) => [
      rel,
      (manifest[rel] || [])
        .filter((i) => i.slug && i.indexable)
        .slice()
        .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
        .slice(0, 6),
    ])
  );

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <span className="eyebrow">Highest-scoring profiles</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Trending Baby Names
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nv-text-secondary">
            The 60 published profiles with the highest popularity scores in our collection — with
            documented meanings, origins and cultural context.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/popularity" className="btn-primary">
              Compare Popularity
            </Link>
            <Link href="/search?sort=popularity" className="btn-ghost">
              Search Full Ranked Collection
            </Link>
          </div>
        </header>

        <AdSlot placement="trending-names-top" />

        {/* 60 Trending Names */}
        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trending.map((item) => (
            <NameCard key={`${item.religion}-${item.slug}`} item={item} showReligion />
          ))}
        </div>

        {/* Trending by Tradition */}
        <section className="mt-16 border-t border-nv-border pt-12" aria-labelledby="byrel-heading">
          <h2 id="byrel-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl mb-6">
            Trending Names by Tradition
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(byReligion).map(([rel, items]) => (
              <div key={rel} className="card p-5 flex flex-col">
                <h3 className="font-display text-lg font-bold text-nv-text mb-3">
                  {religionLabel(rel)} Names
                </h3>
                <ul className="space-y-2 mb-4">
                  {items.map((it) => (
                    <li key={it.slug}>
                      <Link
                        href={`/names/${rel}/${it.slug}`}
                        className="text-sm font-medium text-nv-text-secondary hover:text-nv-accent transition flex justify-between"
                      >
                        <span>{it.name}</span>
                        <span className="text-xs text-nv-text-muted">{it.popularity_score || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/names/${rel}`}
                  className="mt-auto pt-3 text-xs font-semibold text-nv-accent border-t border-nv-border hover:underline"
                >
                  Browse all {religionLabel(rel).toLowerCase()} names &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
