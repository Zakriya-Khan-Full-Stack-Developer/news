import Link from 'next/link';

/**
 * Page selector for a letter hub.
 *
 * Page 1 lives at /names/[religion]/letter/[letter]; later pages live at
 * /names/[religion]/letter/[letter]/page/[n]. Rendering real anchors (rather
 * than buttons) is the whole point — the crawler needs a followable path to
 * every name, and the names past the first 300 of a letter had none.
 */
export default function LetterPagination({ religion, letter, currentPage, pageCount }) {
  if (!pageCount || pageCount < 2) return null;

  const segment = letter === '#' ? '%23' : letter;
  const hrefFor = (n) =>
    n <= 1
      ? `/names/${religion}/letter/${segment}`
      : `/names/${religion}/letter/${segment}/page/${n}`;

  // Window the page numbers so a long hub stays readable.
  const windowSize = 5;
  let start = Math.max(2, currentPage - Math.floor(windowSize / 2));
  let end = Math.min(pageCount - 1, start + windowSize - 1);
  start = Math.max(2, end - windowSize + 1);
  const pages = [];
  for (let n = start; n <= end; n += 1) pages.push(n);

  const linkClass = (active) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
      active
        ? 'border-nv-accent bg-nv-accent text-white'
        : 'border-nv-border bg-nv-surface text-nv-text-secondary hover:border-nv-accent hover:text-nv-accent'
    }`;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={hrefFor(currentPage - 1)} className={linkClass(false)} rel="prev">
          &larr; Previous
        </Link>
      )}

      <Link href={hrefFor(1)} className={linkClass(currentPage === 1)}>
        1
      </Link>

      {start > 2 && <span className="px-1 text-sm text-nv-text-muted">&hellip;</span>}

      {pages.map((n) => (
        <Link key={n} href={hrefFor(n)} className={linkClass(n === currentPage)}>
          {n}
        </Link>
      ))}

      {end < pageCount - 1 && <span className="px-1 text-sm text-nv-text-muted">&hellip;</span>}

      {pageCount > 1 && (
        <Link href={hrefFor(pageCount)} className={linkClass(currentPage === pageCount)}>
          {pageCount}
        </Link>
      )}

      {currentPage < pageCount && (
        <Link href={hrefFor(currentPage + 1)} className={linkClass(false)} rel="next">
          Next &rarr;
        </Link>
      )}
    </nav>
  );
}
