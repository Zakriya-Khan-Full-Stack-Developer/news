import Link from 'next/link';
import {
  SSA_2025_TOP_20,
  SSA_RISERS_2025,
  STATE_TOP_NAMES,
  STATE_DATA_YEARS,
  BABYCENTER_2026,
  resolveName,
} from '../../lib/data/us-names.js';
import { RANKING_DATA } from '../../lib/data/editorial.js';
import { buildCollectionPage, buildItemList, buildBreadcrumb, buildFaq } from '../../lib/data/us-schema.js';
import { pageMetadata } from '../../lib/seo.js';
import JsonLd from '../../components/JsonLd.jsx';
import EditorialMeta from '../../components/EditorialMeta.jsx';
import AdSlot from '../../components/AdSlot.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// A trend is a CHANGE between two dated measurements of the same population.
//
// This page used to sort profiles by a static popularity_score and call the
// result "Trending Baby Names of 2026". A score carried in a record, with no
// date and no time series, cannot show a trend. Every list below is now a
// measured change:
//   • SSA's own fastest risers between the 2024 and 2025 birth cohorts;
//   • top-10 rank movement between those same cohorts;
//   • states whose No. 1 name changed between 2024 and 2025 births;
//   • BabyCenter's in-progress 2026 movement, clearly labelled as such.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://nameverse.site';
const PATH = '/trending-names';
const PAGE_URL = `${SITE_URL}${PATH}`;
const SSA = RANKING_DATA.ssa;

const TITLE = 'Trending Baby Names: Fastest Risers in Official US Data';
const DESCRIPTION =
  'Which baby names are really rising? SSA\u2019s fastest risers from 2024 to 2025 births, top-10 movement, new No. 1 names by state and early 2026 signals.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: 'article' });

const FAQS = [
  {
    q: 'What is the fastest-rising baby name?',
    a: `In SSA\u2019s data for babies born in ${SSA.dataYear}, Kasai rose the most among boys and Klarity among girls. ${SSA_RISERS_2025.note}`,
  },
  {
    q: 'How do you decide that a name is trending?',
    a: 'Only by comparing two dated measurements of the same population \u2014 for example, a name\u2019s SSA rank among babies born in 2024 against its rank among babies born in 2025. We do not call a name trending because of a score, search interest or editorial taste.',
  },
  {
    q: 'Do fast-rising names become popular?',
    a: 'Not necessarily. The biggest jumps usually happen far down the list, where a few hundred extra babies can move a name hundreds of places. Kasai\u2019s record jump still left it at No. 639. A rising name is a signal of fresh interest, not a forecast.',
  },
  {
    q: 'Is there official trend data for 2026?',
    a: `Not yet. SSA publishes each birth year the following May, so 2026 births will be published in May 2027. Until then, BabyCenter\u2019s in-progress table (${BABYCENTER_2026.snapshot} snapshot) is an early, self-reported signal.`,
  },
];

function Rank({ value }) {
  return <span className="tabular-nums">{value}</span>;
}

function NameText({ name }) {
  const r = resolveName(name);
  return r.href ? (
    <Link href={r.href} className="font-semibold text-nv-accent hover:underline">
      {name}
    </Link>
  ) : (
    <span className="font-semibold text-nv-text">{name}</span>
  );
}

export default function TrendingNamesPage() {
  const top10Moves = (rows) =>
    rows
      .slice(0, 10)
      .map((r, i) => ({ ...r, rank: i + 1, diff: (r.prev || i + 1) - (i + 1) }));
  const boysMoves = top10Moves(SSA_2025_TOP_20.boys);
  const girlsMoves = top10Moves(SSA_2025_TOP_20.girls);

  const stateChanges = STATE_TOP_NAMES.flatMap((row) => {
    const out = [];
    if (row.boy !== row.prevBoy) out.push({ state: row.state, sex: 'Boys', now: row.boy, before: row.prevBoy });
    if (row.girl !== row.prevGirl) out.push({ state: row.state, sex: 'Girls', now: row.girl, before: row.prevGirl });
    return out;
  });
  const statesWithChange = new Set(stateChanges.map((c) => c.state)).size;

  const schema = [
    buildCollectionPage({ url: PAGE_URL, name: 'Trending Baby Names: Fastest Risers in Official US Data', description: DESCRIPTION }),
    buildItemList({
      url: PAGE_URL,
      name: `Fastest-rising boy names, ${SSA.previousYear} to ${SSA.dataYear} births (SSA)`,
      items: SSA_RISERS_2025.boys.map((n) => ({ name: n, url: resolveName(n).href })),
      ordered: true,
      idSuffix: 'risers-boys',
    }),
    buildItemList({
      url: PAGE_URL,
      name: `Fastest-rising girl names, ${SSA.previousYear} to ${SSA.dataYear} births (SSA)`,
      items: SSA_RISERS_2025.girls.map((n) => ({ name: n, url: resolveName(n).href })),
      ordered: true,
      idSuffix: 'risers-girls',
    }),
    buildFaq(FAQS),
    buildBreadcrumb([
      { name: 'Home', href: '/' },
      { name: 'Trending baby names', href: PATH },
    ]),
  ].filter(Boolean);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <JsonLd blocks={schema} />

        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-nv-text-muted">
          <Link href="/" className="hover:text-nv-accent">Home</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page" className="font-semibold text-nv-text-secondary">Trending baby names</span>
        </nav>

        <header className="mb-8">
          <span className="eyebrow">Measured change &middot; {SSA.previousYear} &rarr; {SSA.dataYear} births</span>
          <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Trending Baby Names &mdash; the Fastest Risers in Official Data
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            A name is only &ldquo;trending&rdquo; if it moved between two dated counts of the same population.
            Everything on this page is that kind of change: the Social Security Administration&rsquo;s comparison
            of babies born in {SSA.previousYear} and {SSA.dataYear} (released {SSA.releasedLabel}), plus
            BabyCenter&rsquo;s in-progress 2026 table, labelled as an early signal.
          </p>
        </header>

        <AdSlot placement="trending-names-top" />

        {/* ── SSA risers ─────────────────────────────────────────────────── */}
        <section aria-labelledby="risers-heading">
          <h2 id="risers-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            SSA&rsquo;s fastest-rising names ({SSA.previousYear} &rarr; {SSA.dataYear})
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
            SSA&rsquo;s own list of the five names per sex that increased the most in popularity. {SSA_RISERS_2025.note}{' '}
            Big jumps like these happen low in the rankings, where a few hundred extra babies move a name a long way.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              { label: 'Boys', list: SSA_RISERS_2025.boys },
              { label: 'Girls', list: SSA_RISERS_2025.girls },
            ].map((g) => (
              <div key={g.label} className="card p-5">
                <h3 className="font-display text-lg font-bold text-nv-text">Fastest-rising {g.label.toLowerCase()}&rsquo; names</h3>
                <ol className="mt-3 space-y-2">
                  {g.list.map((n, i) => (
                    <li key={n} className="flex items-baseline gap-3 text-sm">
                      <span className="w-5 text-right font-display font-bold text-nv-text-muted">{i + 1}</span>
                      <NameText name={n} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* ── Top-10 movement ────────────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="top10-heading">
          <h2 id="top10-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Movement inside the national top 10
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
            Rank among babies born in {SSA.dataYear} compared with rank among babies born in {SSA.previousYear}.
            The biggest move: Eliana, from No. 18 to No. 10.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {[
              { label: 'Boys', rows: boysMoves },
              { label: 'Girls', rows: girlsMoves },
            ].map((g) => (
              <div key={g.label} className="overflow-x-auto rounded-card border border-nv-border bg-nv-surface">
                <table className="w-full text-left text-sm">
                  <caption className="px-4 pt-4 text-left font-display text-lg font-bold text-nv-text">
                    {g.label}: top 10, {SSA.dataYear} vs {SSA.previousYear}
                  </caption>
                  <thead className="text-xs uppercase tracking-wider text-nv-text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2 font-bold">Name</th>
                      <th scope="col" className="px-4 py-2 text-right font-bold">{SSA.dataYear}</th>
                      <th scope="col" className="px-4 py-2 text-right font-bold">{SSA.previousYear}</th>
                      <th scope="col" className="px-4 py-2 text-right font-bold">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nv-border">
                    {g.rows.map((r) => (
                      <tr key={r.name}>
                        <th scope="row" className="px-4 py-2 font-normal">
                          <NameText name={r.name} />
                        </th>
                        <td className="px-4 py-2 text-right"><Rank value={r.rank} /></td>
                        <td className="px-4 py-2 text-right text-nv-text-muted"><Rank value={r.prev} /></td>
                        <td
                          className={`px-4 py-2 text-right text-xs font-semibold ${
                            r.diff > 0 ? 'text-emerald-700 dark:text-emerald-400' : r.diff < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-nv-text-muted'
                          }`}
                        >
                          {r.diff > 0 ? `\u25B2 ${r.diff}` : r.diff < 0 ? `\u25BC ${-r.diff}` : 'no change'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-nv-text-secondary">
            Full counts for the top 20 are on{' '}
            <Link href="/top-baby-names-2026" className="font-semibold text-nv-accent hover:underline">Top Baby Names 2026</Link>.
          </p>
        </section>

        {/* ── State No. 1 changes ────────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="states-heading">
          <h2 id="states-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            New No. 1 names by state
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
            In {statesWithChange} of 51 states and DC, the most popular boy or girl name for {STATE_DATA_YEARS.current}{' '}
            births differed from {STATE_DATA_YEARS.previous}. Notable: John became Alabama&rsquo;s top boy name and
            Waylon took first place in West Virginia.
          </p>
          <div className="mt-6 overflow-x-auto rounded-card border border-nv-border bg-nv-surface">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">States whose No. 1 baby name changed between {STATE_DATA_YEARS.previous} and {STATE_DATA_YEARS.current} births</caption>
              <thead className="bg-nv-subtle/70 text-xs uppercase tracking-wider text-nv-text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-bold">State</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">List</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">No. 1 in {STATE_DATA_YEARS.current}</th>
                  <th scope="col" className="px-4 py-2.5 font-bold">No. 1 in {STATE_DATA_YEARS.previous}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nv-border">
                {stateChanges.map((c) => (
                  <tr key={`${c.state}-${c.sex}`}>
                    <th scope="row" className="px-4 py-2 font-semibold text-nv-text">{c.state}</th>
                    <td className="px-4 py-2 text-nv-text-muted">{c.sex}</td>
                    <td className="px-4 py-2"><NameText name={c.now} /></td>
                    <td className="px-4 py-2 text-nv-text-secondary">{c.before}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-nv-text-secondary">
            Every state&rsquo;s current and previous No. 1 is on{' '}
            <Link href="/baby-names-by-state" className="font-semibold text-nv-accent hover:underline">Baby Names by State</Link>.
          </p>
        </section>

        {/* ── BabyCenter early signal ────────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="early-heading">
          <h2 id="early-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Early signals for 2026 (BabyCenter, in progress)
          </h2>
          <div className="prose-nv mt-4 max-w-3xl">
            <p>
              BabyCenter ranks the names its users enter during the year, so it can show movement before official
              data exists. In its June 2026 mid-year update it reported Eliana up four places to No. 3 and Milo up
              37 places to No. 93; by its {BABYCENTER_2026.snapshot} snapshot Eliana stood at No. 2 for girls, while
              Noah led the boys. These are self-reported figures from one platform&rsquo;s users, not birth records
              &mdash; useful as a hint, not as a ranking.
            </p>
          </div>
        </section>

        {/* ── What we don't call a trend ─────────────────────────────────── */}
        <section className="mt-14" aria-labelledby="not-trend-heading">
          <h2 id="not-trend-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            What we do not call a trend
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="inset-panel">
              <h3 className="text-sm font-bold text-nv-text">Profile scores</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
                Some NameVerse records carry an internal score. It has no date and no time series, so it cannot show
                change. The <Link href="/popularity" className="font-semibold text-nv-accent hover:underline">comparison tool</Link> labels it as internal.
              </p>
            </div>
            <div className="inset-panel">
              <h3 className="text-sm font-bold text-nv-text">Search interest</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
                People look up names for many reasons. Without a dated, comparable count of babies, search interest
                is not evidence that more children are receiving a name.
              </p>
            </div>
            <div className="inset-panel">
              <h3 className="text-sm font-bold text-nv-text">Religious or community use</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
                National statistics do not record religion, so no dataset here can say a name is trending within a
                faith community.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-5">
            {FAQS.map((f) => (
              <div key={f.q} className="card p-5">
                <h3 className="font-display text-base font-bold text-nv-text sm:text-lg">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <EditorialMeta sources={['ssa2025', 'ssaState2025', 'babycenter', 'babycenterTrends2026']} />
      </div>
    </div>
  );
}
