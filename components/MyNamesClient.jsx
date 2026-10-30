'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  readShortlist,
  writeShortlist,
  removeFromShortlist,
  subscribeShortlist,
  encodeShare,
  decodeShare,
  itemKey,
} from '../lib/shortlist.js';

const TRADITION_LABEL = { islamic: 'Islamic', christian: 'Christian', hindu: 'Hindu', italian: 'Italian' };

// The visitor's saved names. Data never leaves the browser unless the visitor
// copies a share link; a share link holds only `religion:slug` pairs.
export default function MyNamesClient() {
  const [list, setList] = useState([]);
  const [shared, setShared] = useState([]);
  const [index, setIndex] = useState(new Map());
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setList(readShortlist());
    const params = new URLSearchParams(window.location.search);
    const incoming = decodeShare(params.get('names'));
    setShared(incoming);
    setReady(true);
    const unsubscribe = subscribeShortlist(setList);

    // Shared links carry slugs only — look names and meanings up again from
    // the public search index for each tradition that appears in the link.
    const traditions = [...new Set(incoming.map((x) => x.r))];
    if (traditions.length) {
      Promise.all(
        traditions.map((r) =>
          fetch(`/names/${r}/_search-index.json`)
            .then((res) => (res.ok ? res.json() : []))
            .then((items) => items.map((it) => [`${r}:${it.s}`, { ...it, r }]))
            .catch(() => []),
        ),
      ).then((pairs) => setIndex(new Map(pairs.flat())));
    }
    return unsubscribe;
  }, []);

  const sharedResolved = useMemo(
    () =>
      shared
        .map((x) => {
          const hit = index.get(itemKey(x));
          return hit ? { n: hit.n, s: hit.s, r: hit.r, m: hit.m, o: hit.o, g: hit.g } : null;
        })
        .filter(Boolean),
    [shared, index],
  );

  const shareUrl =
    typeof window !== 'undefined' && list.length
      ? `${window.location.origin}/my-names?names=${encodeURIComponent(encodeShare(list))}`
      : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const importShared = () => {
    setList(writeShortlist([...readShortlist(), ...sharedResolved]));
    setShared([]);
    window.history.replaceState(null, '', '/my-names');
  };

  if (!ready) {
    return <p className="mt-6 text-sm text-nv-text-muted">Loading your shortlist…</p>;
  }

  return (
    <div className="mt-6 space-y-8">
      {shared.length > 0 && (
        <section className="rounded-2xl border border-nv-accent/40 bg-nv-accent-subtle/40 p-6" aria-labelledby="shared-heading">
          <h2 id="shared-heading" className="font-display text-lg font-bold text-nv-text">
            Someone shared {shared.length} {shared.length === 1 ? 'name' : 'names'} with you
          </h2>
          {sharedResolved.length > 0 ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sharedResolved.map((it) => (
                  <li key={itemKey(it)}>
                    <Link href={`/names/${it.r}/${it.s}`} className="chip">
                      {it.n}
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={importShared} className="btn-primary mt-4">
                Add these to my shortlist
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-nv-text-secondary">Looking up the shared names…</p>
          )}
        </section>
      )}

      <section aria-labelledby="saved-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="saved-heading" className="font-display text-xl font-bold text-nv-text">
            Your shortlist ({list.length})
          </h2>
          {list.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Link href="/popularity" className="btn-ghost !min-h-[36px] !px-4 !text-xs">
                Compare side by side
              </Link>
              <button type="button" onClick={copy} className="btn-ghost !min-h-[36px] !px-4 !text-xs">
                {copied ? 'Link copied' : 'Copy share link'}
              </button>
              <button
                type="button"
                onClick={() => setList(writeShortlist([]))}
                className="text-xs font-semibold text-nv-text-muted hover:text-nv-error hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {copied ? 'Share link copied to clipboard' : ''}
        </p>

        {list.length > 0 ? (
          <ul className="mt-4 divide-y divide-nv-border overflow-hidden rounded-2xl border border-nv-border bg-nv-surface">
            {list.map((it) => (
              <li key={itemKey(it)} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link href={`/names/${it.r}/${it.s}`} className="font-display text-lg font-bold text-nv-text hover:text-nv-accent">
                    {it.n}
                  </Link>
                  <span className="ml-2 text-xs text-nv-text-muted">
                    {TRADITION_LABEL[it.r] || it.r}
                    {it.o ? ` · ${it.o}` : ''}
                  </span>
                  {it.m && <p className="mt-1 line-clamp-2 text-sm text-nv-text-secondary">{it.m}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setList(removeFromShortlist(it))}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-nv-text-muted transition hover:bg-nv-subtle hover:text-nv-error"
                  aria-label={`Remove ${it.n} from shortlist`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-nv-border bg-nv-surface p-8 text-center">
            <p className="text-sm text-nv-text-secondary">
              No saved names yet. Open any name profile and choose <strong>Save to shortlist</strong>, or add names on
              the{' '}
              <Link href="/popularity" className="font-semibold text-nv-accent hover:underline">
                comparison page
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/search" className="btn-primary">Search names</Link>
              <Link href="/top-baby-names-2026" className="btn-ghost">Top names 2026</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
