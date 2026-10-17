'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  readShortlist,
  writeShortlist,
  addToShortlist,
  removeFromShortlist,
  subscribeShortlist,
  itemKey,
} from '../lib/shortlist.js';

const TRADITIONS = ['islamic', 'christian', 'hindu'];
const TRADITION_LABEL = { islamic: 'Islamic', christian: 'Christian', hindu: 'Hindu' };
const GENDER_LABEL = { boy: 'Boy', girl: 'Girl', unisex: 'Unisex' };

// Side-by-side comparison of the visitor's shortlist.
//
// What it compares is deliberately limited to fields we can stand behind:
// recorded meaning, origin, tradition and gender, spelling length, and — only
// where it exists — an official US rank (SSA, babies born in 2025) or the
// BabyCenter 2026 in-progress rank, each labelled with its source. The old
// "Popularity Meter" drew a bar from an undocumented internal score, which
// showed Muhammad at 0 next to Aarav at 100; it is gone. Any internal score is
// shown as text, labelled as internal, and only when it is non-zero.
export default function CompareNamesClient({ usRanks = {}, quickAdd = [] }) {
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(readShortlist());
    const unsubscribe = subscribeShortlist(setList);
    Promise.all(
      TRADITIONS.map((r) =>
        fetch(`/names/${r}/_search-index.json`)
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => items.map((it) => ({ ...it, r })))
          .catch(() => []),
      ),
    ).then((arrays) => {
      setIndex(arrays.flat());
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const byKey = useMemo(() => {
    const m = new Map();
    for (const it of index) m.set(`${it.r}:${it.s}`, it);
    return m;
  }, [index]);

  const q = query.trim().toLowerCase();
  const suggestions = q
    ? index.filter((it) => String(it.n || '').toLowerCase().startsWith(q)).slice(0, 8)
    : [];

  const add = (it) => {
    setList(addToShortlist({ n: it.n, s: it.s, r: it.r, m: it.m, o: it.o, g: it.g }));
    setQuery('');
  };

  const quickAddItems = quickAdd
    .map((qa) => byKey.get(`${qa.r}:${qa.s}`))
    .filter(Boolean);

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-nv-border bg-nv-surface/90 p-5 shadow-lg sm:p-7">
        <label htmlFor="compare-add" className="mb-2 block text-xs font-bold uppercase tracking-wider text-nv-text-muted">
          Add a name to your shortlist
        </label>
        <div className="relative">
          <input
            id="compare-add"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={loading ? 'Loading names…' : 'Type a name, e.g. Zain, Noah, Aarav, Maryam'}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="compare-suggestions"
            aria-expanded={suggestions.length > 0}
            className="w-full rounded-xl border border-nv-border bg-nv-subtle/50 px-4 py-3 text-sm text-nv-text placeholder-nv-text-muted transition focus:border-nv-accent focus:bg-nv-surface focus:outline-none focus:ring-2 focus:ring-nv-accent/20"
          />
          {suggestions.length > 0 && (
            <ul
              id="compare-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-nv-border bg-nv-surface p-2 shadow-2xl"
            >
              {suggestions.map((it) => (
                <li key={`${it.r}-${it.s}`} role="option" aria-selected="false">
                  <button
                    type="button"
                    onClick={() => add(it)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl p-2.5 text-left text-sm transition hover:bg-nv-subtle"
                  >
                    <span className="font-bold text-nv-text">{it.n}</span>
                    <span className="truncate text-xs text-nv-text-muted">
                      {TRADITION_LABEL[it.r]}
                      {it.o ? ` · ${it.o}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {quickAddItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-nv-border/60 pt-3">
            <span className="text-xs font-semibold text-nv-text-muted">Quick add (SSA top 10, 2025 births):</span>
            {quickAddItems.map((it) => (
              <button
                key={`${it.r}-${it.s}`}
                type="button"
                onClick={() => add(it)}
                className="rounded-lg border border-nv-border bg-nv-subtle/60 px-2.5 py-1 text-xs font-medium text-nv-text-secondary transition hover:border-nv-accent hover:text-nv-accent"
              >
                {it.n}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {list.length} {list.length === 1 ? 'name' : 'names'} in your shortlist
      </p>

      {list.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h2 className="font-display text-lg font-bold text-nv-text">
              Comparing {list.length} {list.length === 1 ? 'name' : 'names'}
            </h2>
            <div className="flex gap-4">
              <Link href="/my-names" className="text-xs font-semibold text-nv-accent hover:underline">
                Manage &amp; share shortlist
              </Link>
              <button
                type="button"
                onClick={() => setList(writeShortlist([]))}
                className="text-xs font-semibold text-nv-text-muted hover:text-nv-error hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((saved) => {
              const it = { ...saved, ...(byKey.get(itemKey(saved)) || {}) };
              const rank = usRanks[String(it.n || '').toLowerCase()];
              return (
                <div key={itemKey(saved)} className="rounded-2xl border border-nv-border bg-nv-surface p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/names/${it.r}/${it.s}`}
                        className="font-display text-2xl font-bold text-nv-text transition hover:text-nv-accent"
                      >
                        {it.n}
                      </Link>
                      <span className="mt-1 block text-xs text-nv-text-muted">
                        {TRADITION_LABEL[it.r] || it.r} profile
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setList(removeFromShortlist(saved))}
                      className="grid h-8 w-8 place-items-center rounded-lg text-nv-text-muted transition hover:bg-nv-subtle hover:text-nv-error"
                      aria-label={`Remove ${it.n}`}
                    >
                      &times;
                    </button>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div className="col-span-2">
                      <dt className="font-semibold text-nv-text-muted">Recorded meaning</dt>
                      <dd className="mt-0.5 text-sm text-nv-text-secondary">{it.m || 'Not recorded'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-nv-text-muted">Origin</dt>
                      <dd className="mt-0.5 text-nv-text">{it.o || 'Not recorded'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-nv-text-muted">Recorded gender</dt>
                      <dd className="mt-0.5 text-nv-text">{GENDER_LABEL[it.g] || 'Not recorded'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-nv-text-muted">Letters</dt>
                      <dd className="mt-0.5 text-nv-text">{String(it.n || '').replace(/[^A-Za-z]/g, '').length}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-nv-text-muted">US rank (SSA, 2025 births)</dt>
                      <dd className="mt-0.5 text-nv-text">
                        {rank?.ssa
                          ? `No. ${rank.ssa.rank} ${rank.ssa.sex} · ${rank.ssa.count.toLocaleString('en-US')} babies`
                          : 'Outside our SSA top-20 table'}
                      </dd>
                    </div>
                    {rank?.bc && (
                      <div className="col-span-2">
                        <dt className="font-semibold text-nv-text-muted">BabyCenter 2026 (in progress)</dt>
                        <dd className="mt-0.5 text-nv-text">No. {rank.bc.rank} {rank.bc.sex}</dd>
                      </div>
                    )}
                    {Number(it.p) > 0 && (
                      <div className="col-span-2">
                        <dt className="font-semibold text-nv-text-muted">NameVerse profile score (internal)</dt>
                        <dd className="mt-0.5 text-nv-text-secondary">
                          {it.p} &mdash; a score carried in the source record; not a birth count or trend.
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5 border-t border-nv-border/60 pt-3 text-right text-xs">
                    <Link href={`/names/${it.r}/${it.s}`} className="font-bold text-nv-accent hover:underline">
                      Full profile &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-nv-border bg-nv-surface p-12 text-center shadow-sm">
          <h2 className="text-base font-bold text-nv-text">Your shortlist is empty</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-nv-text-secondary">
            Add names with the box above, or use &ldquo;Save to shortlist&rdquo; on any name profile. Your list is
            stored only in this browser.
          </p>
        </div>
      )}
    </div>
  );
}
