'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PopularityClient({ initialList = [] }) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [shortlist, setShortlist] = useState(initialList);

  useEffect(() => {
    Promise.all(
      ['islamic', 'christian', 'hindu'].map((r) =>
        fetch(`/names/${r}/_search-index.json`)
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => items.map((item) => ({ ...item, religion: r })))
          .catch(() => [])
      )
    ).then((arrays) => {
      setData(arrays.flat());
    });
  }, []);

  const suggestions = query.trim()
    ? data
        .filter((item) => (item.n || '').toLowerCase().startsWith(query.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  const addName = (item) => {
    if (!shortlist.some((s) => s.religion === item.religion && s.s === item.s)) {
      setShortlist([...shortlist, item]);
    }
    setQuery('');
  };

  const removeName = (index) => {
    setShortlist(shortlist.filter((_, i) => i !== index));
  };

  const maxScore = Math.max(...shortlist.map((i) => i.p || 0), 100);

  const presets = [
    { a: 'Muhammad', rA: 'islamic', b: 'Aarav', rB: 'hindu' },
    { a: 'Noah', rA: 'christian', b: 'Liam', rB: 'christian' },
    { a: 'Sofia', rA: 'christian', b: 'Zainab', rB: 'islamic' },
  ];

  const loadPreset = (nameA, nameB) => {
    const itemA = data.find((d) => (d.n || '').toLowerCase() === nameA.toLowerCase());
    const itemB = data.find((d) => (d.n || '').toLowerCase() === nameB.toLowerCase());
    const toAdd = [itemA, itemB].filter(Boolean);
    if (toAdd.length > 0) {
      setShortlist(toAdd);
    }
  };

  return (
    <div>
      {/* Search & Add Input */}
      <div className="rounded-2xl border border-nv-border bg-nv-surface/90 p-5 sm:p-7 shadow-lg backdrop-blur-xl mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-nv-text-muted mb-2">
          Add Name to Comparison
        </label>
        <div className="relative">
          <svg className="absolute left-4 top-3.5 h-5 w-5 text-nv-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a baby name to compare… (e.g. Muhammad, Liam, Aarav, Sofia, Zara)"
            aria-label="Add name to comparison"
            className="w-full rounded-xl border border-nv-border bg-nv-subtle/50 py-3 pl-12 pr-4 text-sm text-nv-text placeholder-nv-text-muted transition focus:border-nv-accent focus:bg-nv-surface focus:outline-none focus:ring-2 focus:ring-nv-accent/20"
          />

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-nv-border bg-nv-surface p-2 shadow-2xl backdrop-blur-xl">
              <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-nv-text-muted">
                Click to add:
              </span>
              {suggestions.map((item) => (
                <button
                  key={`${item.religion}-${item.s}`}
                  type="button"
                  onClick={() => addName(item)}
                  className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm hover:bg-nv-subtle transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-nv-text">{item.n}</span>
                    <span className="badge border border-nv-border bg-nv-subtle text-[10px] uppercase text-nv-text-secondary">
                      {item.religion}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-nv-accent">Popularity Index: {item.p || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preset Quick Comparisons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-nv-border/60">
          <span className="text-xs font-semibold text-nv-text-muted">Popular Pairings:</span>
          {presets.map((p) => (
            <button
              key={`${p.a}-${p.b}`}
              type="button"
              onClick={() => loadPreset(p.a, p.b)}
              className="rounded-lg border border-nv-border bg-nv-subtle/60 px-2.5 py-1 text-xs font-medium text-nv-text-secondary hover:border-nv-accent hover:text-nv-accent transition"
            >
              {p.a} vs {p.b}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid */}
      {shortlist.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-lg font-bold text-nv-text">
              Comparing {shortlist.length} Names
            </h3>
            <button
              type="button"
              onClick={() => setShortlist([])}
              className="text-xs font-semibold text-nv-accent hover:underline"
            >
              Clear comparison
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {shortlist.map((item, idx) => {
              const pct = Math.min(100, Math.round(((item.p || 0) / maxScore) * 100));
              return (
                <div
                  key={`${item.religion}-${item.s}-${idx}`}
                  className="rounded-2xl border border-nv-border bg-nv-surface p-6 shadow-sm relative overflow-hidden transition hover:border-nv-accent/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/names/${item.religion}/${item.s}`}
                          className="font-display text-2xl font-bold text-nv-text hover:text-nv-accent transition"
                        >
                          {item.n}
                        </Link>
                        <span className="badge border border-nv-border bg-nv-subtle text-[10px] uppercase font-bold text-nv-text">
                          {item.religion}
                        </span>
                      </div>
                      {item.o && <span className="text-xs text-nv-text-muted mt-0.5 block">{item.o} origin</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeName(idx)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-nv-text-muted hover:bg-nv-subtle hover:text-nv-error transition"
                      aria-label={`Remove ${item.n}`}
                    >
                      &times;
                    </button>
                  </div>

                  {item.m && (
                    <p className="mt-3 text-xs leading-relaxed text-nv-text-secondary line-clamp-2">
                      &ldquo;{item.m}&rdquo;
                    </p>
                  )}

                  {/* Meter Metric Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-nv-text-muted">Popularity Meter</span>
                      <span className="font-bold text-nv-accent">{item.p || 0} / {maxScore}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-nv-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-nv-accent to-emerald-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-nv-border/60 pt-3 text-xs">
                    <span className="text-nv-text-muted">
                      Lucky Number: <strong className="text-nv-text">{item.l || 'N/A'}</strong>
                    </span>
                    <Link
                      href={`/names/${item.religion}/${item.s}`}
                      className="font-bold text-nv-accent hover:underline"
                    >
                      Full Profile &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-nv-border bg-nv-surface p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nv-subtle text-xl">
            ⚖️
          </div>
          <h3 className="text-base font-bold text-nv-text">Your Comparison List is Empty</h3>
          <p className="mt-1 text-xs text-nv-text-secondary max-w-md mx-auto">
            Use the search box above to add two or more names to see how they compare in popularity scores, linguistic roots, and lucky numbers.
          </p>
        </div>
      )}
    </div>
  );
}
