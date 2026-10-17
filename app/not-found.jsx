import Link from 'next/link';
import { getManifest } from '../lib/data/names-data.js';

// FIX — these counts were hardcoded in the era when the manifest advertised
// 42,310 names. The dataset is now 11,412 records, so the 404 page was telling
// users and crawlers that ~28,500 names exist which do not. During a migration
// that matters a great deal: thousands of removed URLs now resolve to this
// page, so it is the single most-crawled page on the site, and it was
// over-claiming the site's size on every hit. Read the real numbers from the
// manifest so they can never drift again.
const TRADITIONS = ['islamic', 'christian', 'hindu'];

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has moved.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const manifest = getManifest();
  const total = TRADITIONS.reduce(
    (sum, rel) => sum + (manifest[rel] || []).filter((item) => item.indexable).length,
    0,
  );
  const traditions = TRADITIONS.map((rel) => ({
    rel,
    count: (manifest[rel] || []).filter((item) => item.indexable).length,
  }));

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge bg-nv-accent-subtle text-nv-accent">404 Error</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-nv-text sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-base leading-relaxed text-nv-text-secondary sm:text-lg">
          The baby name, guide or page you are looking for might have been moved, renamed or does not exist.
        </p>

        {/* Search Bar */}
        <form action="/search" method="get" className="mt-8">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              placeholder={`Search ${total.toLocaleString()} baby names…`}
              aria-label="Search baby names"
              className="input flex-1"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </div>
        </form>

        {/* Recovery Links */}
        <div className="mt-10 rounded-2xl border border-nv-border bg-nv-surface p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">
            Explore traditions
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {traditions.map(({ rel, count }) => (
              <Link
                key={rel}
                href={`/names/${rel}`}
                className="rounded-xl border border-nv-border bg-nv-subtle p-3 text-center transition hover:border-nv-accent hover:text-nv-accent"
              >
                <span className="block text-sm font-semibold capitalize text-nv-text">{rel}</span>
                <span className="text-xs text-nv-text-muted">{count.toLocaleString()} names</span>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn-primary">
              Back to Homepage
            </Link>
            <Link href="/top-baby-names-2026" className="btn-ghost">
              Top Names 2026
            </Link>
            <Link href="/unique-baby-names" className="btn-ghost">
              Unique Names
            </Link>
            <Link href="/popularity" className="btn-ghost">
              Compare Names
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
