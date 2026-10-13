import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has moved.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
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
              placeholder="Search 42,000+ baby names…"
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
            <Link
              href="/names/islamic"
              className="rounded-xl border border-nv-border bg-nv-subtle p-3 text-center transition hover:border-nv-accent hover:text-nv-accent"
            >
              <span className="block text-sm font-semibold text-nv-text">Islamic</span>
              <span className="text-xs text-nv-text-muted">18k+ names</span>
            </Link>
            <Link
              href="/names/christian"
              className="rounded-xl border border-nv-border bg-nv-subtle p-3 text-center transition hover:border-nv-accent hover:text-nv-accent"
            >
              <span className="block text-sm font-semibold text-nv-text">Christian</span>
              <span className="text-xs text-nv-text-muted">12k+ names</span>
            </Link>
            <Link
              href="/names/hindu"
              className="rounded-xl border border-nv-border bg-nv-subtle p-3 text-center transition hover:border-nv-accent hover:text-nv-accent"
            >
              <span className="block text-sm font-semibold text-nv-text">Hindu</span>
              <span className="text-xs text-nv-text-muted">10k+ names</span>
            </Link>
            <Link
              href="/names/italian"
              className="rounded-xl border border-nv-border bg-nv-subtle p-3 text-center transition hover:border-nv-accent hover:text-nv-accent"
            >
              <span className="block text-sm font-semibold text-nv-text">Italian</span>
              <span className="text-xs text-nv-text-muted">350+ names</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn-primary">
              Back to Homepage
            </Link>
            <Link href="/trending-names" className="btn-ghost">
              Trending Names
            </Link>
            <Link href="/unique-baby-names" className="btn-ghost">
              Unique Names
            </Link>
            <Link href="/popularity" className="btn-ghost">
              Popularity Tool
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
