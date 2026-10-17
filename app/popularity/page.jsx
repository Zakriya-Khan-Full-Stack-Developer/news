import Link from 'next/link';
import { SSA_2025_TOP_20, BABYCENTER_2026, SSA_TOP_10, resolveName } from '../../lib/data/us-names.js';
import { RANKING_DATA } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import CompareNamesClient from '../../components/CompareNamesClient.jsx';
import AdSlot from '../../components/AdSlot.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Name comparison tool (route kept at /popularity for existing links).
//
// This page used to be "Compare Baby Name Popularity" with a "Top 50 Most
// Popular Names of 2026" grid, both driven by an undocumented 50–100 score that
// every Islamic record lacks (all zeros). It now compares what we can source:
// recorded meaning, origin and gender, plus official US ranks where they exist.
// ─────────────────────────────────────────────────────────────────────────────

const SSA = RANKING_DATA.ssa;

export const metadata = pageMetadata({
  title: 'Compare Baby Names Side by Side',
  description:
    'Compare baby names side by side: meaning, origin, gender and spelling, plus official US ranks (SSA, 2025 births) where they exist. Saved on your device.',
  path: '/popularity',
});

function buildUsRanks() {
  const out = {};
  for (const sex of ['boys', 'girls']) {
    SSA_2025_TOP_20[sex].forEach((row, i) => {
      const key = row.name.toLowerCase();
      out[key] = out[key] || {};
      if (!out[key].ssa) out[key].ssa = { rank: i + 1, sex: sex === 'boys' ? 'boys' : 'girls', count: row.count };
    });
    BABYCENTER_2026[sex].forEach((name, i) => {
      const key = name.toLowerCase();
      out[key] = out[key] || {};
      if (!out[key].bc) out[key].bc = { rank: i + 1, sex };
    });
  }
  return out;
}

export default function ComparePage() {
  const quickAdd = [...SSA_TOP_10.boys.slice(0, 5), ...SSA_TOP_10.girls.slice(0, 5)]
    .map((n) => resolveName(n))
    .filter((r) => r.hasProfile)
    .map((r) => ({ r: r.religion, s: r.href.split('/').pop() }));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <span className="eyebrow">Your shortlist</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Compare Baby Names Side by Side
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nv-text-secondary">
            Add the names you are considering and compare their recorded meanings, origins and spelling &mdash; with
            official US ranks shown wherever a name appears in the latest national data. Your list is saved only in
            this browser.
          </p>
        </header>

        <AdSlot placement="popularity-top" />

        <CompareNamesClient usRanks={buildUsRanks()} quickAdd={quickAdd} />

        <section className="mt-16 grid gap-6 border-t border-nv-border pt-12 md:grid-cols-3" aria-label="About this comparison">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">What is compared</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Meaning, origin, tradition and gender come from each name&rsquo;s structured NameVerse record and are
              shown exactly as recorded &mdash; &ldquo;Not recorded&rdquo; means the record is silent, not that the
              answer is unisex or unknown in the world.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">Where US ranks come from</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              The SSA rank is from Social Security card applications for babies born in {SSA.dataYear} (released{' '}
              {SSA.releasedLabel}); we hold the top 20 per sex. BabyCenter&rsquo;s rank is its in-progress 2026
              table ({BABYCENTER_2026.snapshot}), which is self-reported. See{' '}
              <Link href="/top-baby-names-2026" className="font-semibold text-nv-accent hover:underline">Top Baby Names 2026</Link>.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">About profile scores</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Some source records carry an internal score whose original method is not documented, and many records
              (including every Islamic profile) carry none. We show it as text only when present and never use it as
              a popularity statistic, a trend or a ranking.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
