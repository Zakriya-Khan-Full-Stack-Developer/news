import Link from 'next/link';
import {
  getCluster,
  SSA_2025_TOP_20,
  SSA_RISERS_2025,
  SSA_TOP_1000_SHARE_2025,
  BABYCENTER_2026,
  resolveName,
  resolveNames,
} from '../../lib/data/us-names.js';
import { buildUsPageSchema, buildItemList } from '../../lib/data/us-schema.js';
import { EDITORIAL_FAQ, RANKING_DATA } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';
import UsPageShell from '../../components/UsPageShell.jsx';
import RankedNameList from '../../components/RankedNameList.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// The single national-ranking page.
//
// /popular-names-2026 used to target the same intent with the same two lists;
// it now 301-redirects here and its unique analysis lives below. Every ranking
// on this page names its population and period:
//   • SSA — Social Security card applications for babies BORN IN 2025,
//     released May 8, 2026. There is no official 2026 ranking until May 2027.
//   • BabyCenter — names volunteered by BabyCenter users during 2026, an
//     in-progress, self-reported table (August 2026 snapshot).
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = 'https://nameverse.site';
const cluster = getCluster('top-baby-names-2026');
const PAGE_URL = `${SITE_URL}/${cluster.slug}`;
const SSA = RANKING_DATA.ssa;

const TITLE = 'Top Baby Names 2026: Latest SSA & BabyCenter Rankings';
const DESCRIPTION =
  'The latest official US ranking (SSA, babies born in 2025, released May 2026) with birth counts and rank changes, plus BabyCenter\u2019s in-progress 2026 top 40.';

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${cluster.slug}`,
  type: 'article',
});

const FAQS = [
  {
    q: 'What are the top baby names right now?',
    a: `The most recent official US ranking covers babies born in ${SSA.dataYear} and was released by the Social Security Administration on ${SSA.releasedLabel}. Liam and Olivia are No. 1. For boys, Noah, Oliver, Theodore and Henry complete the top five; for girls, Charlotte, Emma, Amelia and Sophia. An official ranking for 2026 births will not exist until SSA\u2019s next release in May 2027.`,
  },
  {
    q: 'What is the most popular boy name in America?',
    a: `Liam, given to 20,818 boys born in ${SSA.dataYear} according to SSA. It has been the No. 1 boy name every year since 2017. Noah is a close second (20,358). BabyCenter\u2019s in-progress 2026 table currently places Noah first, which reflects a different, self-reported population rather than a contradiction.`,
  },
  {
    q: 'What is the most popular girl name in America?',
    a: `Olivia, given to 13,544 girls born in ${SSA.dataYear}, and No. 1 for the seventh consecutive year. Charlotte (13,400) rose from fourth to second, ending Emma\u2019s run in the No. 2 spot.`,
  },
  {
    q: 'Which baby names are rising fastest?',
    a: `SSA lists the names that increased the most in popularity between 2024 and 2025: ${SSA_RISERS_2025.boys.join(', ')} for boys and ${SSA_RISERS_2025.girls.join(', ')} for girls. ${SSA_RISERS_2025.note}`,
  },
  {
    q: 'How much of the population do the top names cover?',
    a: `Less than you might think. SSA reports that the top 1,000 names covered about ${Math.round(SSA_TOP_1000_SHARE_2025.total)}% of all babies born in ${SSA.dataYear} (${SSA_TOP_1000_SHARE_2025.boys}% of boys, ${SSA_TOP_1000_SHARE_2025.girls}% of girls). Names given to fewer than five babies are not published at all, for privacy.`,
  },
  ...EDITORIAL_FAQ.slice(0, 2),
];

const BREADCRUMB = [{ name: 'Top Baby Names 2026', href: '/top-baby-names-2026' }];

function movement(rank, prev) {
  if (!prev) return { label: '\u2014', tone: 'text-nv-text-muted', sr: 'previous rank not shown' };
  const diff = prev - rank;
  if (diff === 0) return { label: '=', tone: 'text-nv-text-muted', sr: 'same rank as 2024' };
  if (diff > 0) return { label: `\u25B2 ${diff}`, tone: 'text-emerald-700 dark:text-emerald-400', sr: `up ${diff} from ${prev} in 2024` };
  return { label: `\u25BC ${-diff}`, tone: 'text-rose-700 dark:text-rose-400', sr: `down ${-diff} from ${prev} in 2024` };
}

function SsaTable({ rows, caption }) {
  return (
    <div className="overflow-x-auto rounded-card border border-nv-border bg-nv-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-nv-subtle/70 text-xs uppercase tracking-wider text-nv-text-muted">
          <tr>
            <th scope="col" className="px-3 py-2.5 text-right font-bold">Rank</th>
            <th scope="col" className="px-3 py-2.5 font-bold">Name</th>
            <th scope="col" className="px-3 py-2.5 text-right font-bold">Babies (2025)</th>
            <th scope="col" className="px-3 py-2.5 text-right font-bold">vs 2024</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-nv-border">
          {rows.map((row, i) => {
            const rank = i + 1;
            const r = resolveName(row.name);
            const mv = movement(rank, row.prev);
            return (
              <tr key={row.name}>
                <td className="px-3 py-2.5 text-right font-display font-bold tabular-nums text-nv-text-muted">{rank}</td>
                <th scope="row" className="px-3 py-2.5 font-semibold text-nv-text">
                  {r.href ? (
                    <Link href={r.href} className="text-nv-accent hover:underline">{row.name}</Link>
                  ) : (
                    row.name
                  )}
                </th>
                <td className="px-3 py-2.5 text-right tabular-nums text-nv-text-secondary">{row.count.toLocaleString('en-US')}</td>
                <td className={`px-3 py-2.5 text-right text-xs font-semibold tabular-nums ${mv.tone}`}>
                  <span aria-hidden="true">{mv.label}</span>
                  <span className="sr-only">{mv.sr}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TopBabyNames2026Page() {
  const bcBoys = resolveNames(BABYCENTER_2026.boys);
  const bcGirls = resolveNames(BABYCENTER_2026.girls);

  const toItems = (rows) =>
    rows.map((row) => {
      const r = resolveName(row.name);
      return { name: row.name, url: r.href, description: `${row.count.toLocaleString('en-US')} babies born in ${SSA.dataYear} (SSA)` };
    });

  const schema = [
    ...buildUsPageSchema({
      url: PAGE_URL,
      cluster,
      description: DESCRIPTION,
      breadcrumb: BREADCRUMB,
      faqs: FAQS,
      sourceKeys: ['ssa2025', 'ssaTop', 'ssaLimits', 'babycenter'],
    }),
    // Two genuinely ranked lists (position = SSA rank), one per sex.
    buildItemList({
      url: PAGE_URL,
      name: `Top 20 boy names, babies born in ${SSA.dataYear} (SSA)`,
      items: toItems(SSA_2025_TOP_20.boys),
      ordered: true,
      idSuffix: 'ssa-boys',
    }),
    buildItemList({
      url: PAGE_URL,
      name: `Top 20 girl names, babies born in ${SSA.dataYear} (SSA)`,
      items: toItems(SSA_2025_TOP_20.girls),
      ordered: true,
      idSuffix: 'ssa-girls',
    }),
  ];

  return (
    <UsPageShell
      cluster={cluster}
      intro={`The newest official US baby-name ranking covers babies born in ${SSA.dataYear}; the Social Security Administration released it on ${SSA.releasedLabel}. Below are the top 20 boy and girl names with the number of babies given each name and how each top-10 name moved since 2024 \u2014 followed by BabyCenter\u2019s in-progress 2026 table, labelled for what it is.`}
      breadcrumb={BREADCRUMB}
      faqs={FAQS}
      schema={schema}
      sources={['ssa2025', 'ssaTop', 'ssaLimits', 'babycenter', 'babycenterTrends2026']}
      cta={
        <>
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">Find the name that fits your family</h2>
          <p className="mt-2 max-w-2xl text-sm text-nv-text-secondary">
            Every linked name opens a profile with its recorded meaning, origin and pronunciation. Save the ones
            you like to your shortlist and compare them side by side.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search" className="btn-primary">Search all names</Link>
            <Link href="/trending-names" className="btn-ghost">Fastest-rising names</Link>
            <Link href="/my-names" className="btn-ghost">Your shortlist</Link>
          </div>
        </>
      }
    >
      {/* ── H2: official SSA ranking ─────────────────────────────────────── */}
      <section aria-labelledby="ssa-heading">
        <h2 id="ssa-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Official top 20: babies born in {SSA.dataYear}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          Source: Social Security Administration, released {SSA.releasedLabel}. Population: {SSA.population}.
          Counts are the number of babies given each name; &ldquo;vs 2024&rdquo; compares each top-10 name with
          its rank among babies born in 2024. Spellings are counted separately, so Sofia and Sophia are two
          entries.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-nv-text">Top 20 boy names ({SSA.dataYear} births)</h3>
            <SsaTable rows={SSA_2025_TOP_20.boys} caption={`Top 20 boy names, babies born in ${SSA.dataYear}, SSA`} />
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-nv-text">Top 20 girl names ({SSA.dataYear} births)</h3>
            <SsaTable rows={SSA_2025_TOP_20.girls} caption={`Top 20 girl names, babies born in ${SSA.dataYear}, SSA`} />
          </div>
        </div>
      </section>

      {/* ── H2: what changed ─────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="changed-heading">
        <h2 id="changed-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          What changed between 2024 and 2025
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Girls: Charlotte to No. 2, Eliana into the top 10</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Charlotte climbed from fourth to second, ending Emma&rsquo;s six-year run as runner-up. Eliana jumped
              from 18th to 10th, and Ava &mdash; a top-10 fixture for years &mdash; slipped to 11th.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Boys: a stable top four</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Liam, Noah, Oliver and Theodore held their places. Below them, names swapped single positions:
              Henry and James traded fifth and sixth, Elijah and Mateo seventh and eighth, William and Lucas
              ninth and tenth.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Long runs at the top</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Olivia has been the No. 1 girl name for seven straight years and Liam the No. 1 boy name every
              year since 2017 &mdash; but the gap is small: Noah trailed Liam by fewer than 500 babies.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">The fastest risers (SSA)</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Boys: {SSA_RISERS_2025.boys.join(', ')}. Girls: {SSA_RISERS_2025.girls.join(', ')}. {SSA_RISERS_2025.note}{' '}
              <Link href="/trending-names" className="font-semibold text-nv-accent hover:underline">More on rising names</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── H2: BabyCenter 2026 (in progress) ────────────────────────────── */}
      <section className="mt-14" aria-labelledby="bc-heading">
        <h2 id="bc-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          BabyCenter&rsquo;s 2026 top 40 (in progress)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
          BabyCenter ranks the names parents enter on its site during the year. It is the only table that
          covers 2026 births so far, but it is self-reported and not a census: treat it as an early signal,
          not an official rank. Snapshot: {BABYCENTER_2026.snapshot}. Ranks are BabyCenter&rsquo;s own &mdash;
          we do not re-rank.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-nv-text">Top 40 boy names (BabyCenter 2026)</h3>
            <RankedNameList items={bcBoys} />
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-nv-text">Top 40 girl names (BabyCenter 2026)</h3>
            <RankedNameList items={bcGirls} />
          </div>
        </div>
      </section>

      {/* ── H2: why they differ ──────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="differ-heading">
        <h2 id="differ-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Why the two rankings disagree
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            The lists share most of their names but not their order, and the reason is the population, not a
            dispute about facts. SSA counts Social Security card applications for every baby born in a calendar
            year, so it is complete but published months after the year ends. BabyCenter counts names that its
            users choose to enter during the current year: faster, but a self-selecting group.
          </p>
          <p>
            So the SSA list answers &ldquo;what was actually most common among babies born in {SSA.dataYear}&rdquo;,
            while BabyCenter is a partial preview of 2026. Where they diverge &mdash; most visibly at the top of the
            boys&rsquo; list, where SSA places <strong>Liam</strong> first and BabyCenter places <strong>Noah</strong>{' '}
            first &mdash; we show both rather than presenting either as settled.
          </p>
        </div>
      </section>

      {/* ── H2: patterns ─────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="patterns-heading">
        <h2 id="patterns-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          Patterns you can see in the lists
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Short, vowel-ending boys&rsquo; names</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Noah, Mateo, Luca, Leo and Ezra all sit in the SSA top 20 &mdash; short names with an open vowel
              ending that travel easily between languages.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Biblical names in the centre of the list</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Noah, Elijah, James, Benjamin, Levi, Samuel and Ezra are all in the boys&rsquo; top 20 for 2025
              births. See our <Link href="/biblical-baby-names" className="font-semibold text-nv-accent hover:underline">biblical names</Link> guide.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">The &lsquo;-a&rsquo; ending for girls</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Olivia, Emma, Amelia, Sophia, Mia, Isabella, Sofia, Eliana, Ava, Aurora, Camila and Nora &mdash;
              twelve of the girls&rsquo; top 20 end in &lsquo;a&rsquo;.
            </p>
          </div>
          <div className="inset-panel">
            <h3 className="text-sm font-bold text-nv-text">Spelling variants split the count</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
              Sofia (No. 9) and Sophia (No. 5) are counted separately, as are Luca and Lucas. Combined, some
              pronunciations are more common than either spelling&rsquo;s rank suggests.
            </p>
          </div>
        </div>
      </section>

      {/* ── H2: how to read ──────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          How to read a top-names list
        </h2>
        <div className="prose-nv mt-4 max-w-3xl">
          <p>
            A ranking tells you how many babies received a name, not how good the name is. Its most practical use
            is social: it tells you how likely your child is to share a name with classmates. Even the No. 1 name,
            Liam, was given to roughly one boy in a hundred born in {SSA.dataYear}.
          </p>
          <p>
            Rankings also understate how varied naming really is. The top 1,000 names covered about{' '}
            {Math.round(SSA_TOP_1000_SHARE_2025.total)}% of babies born in {SSA.dataYear}, so more than a quarter of
            children received a name outside the entire published top 1,000.
          </p>
          <p>
            If you want a name that is recognisable without being crowded, look past the top 100. Our{' '}
            <Link href="/unique-baby-names" className="font-semibold text-nv-accent hover:underline">unique baby names</Link>{' '}
            page explains how to check rarity, and the{' '}
            <Link href="/baby-names-by-state" className="font-semibold text-nv-accent hover:underline">state rankings</Link>{' '}
            show how much local tastes differ.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="more-heading">
        <h2 id="more-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
          More name lists
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/trending-names', label: 'Fastest-rising names', note: 'SSA risers, 2024 \u2192 2025' },
            { href: '/baby-names-by-state', label: 'Names by state', note: 'All 50 states + DC, 2025 births' },
            { href: '/unique-baby-names', label: 'Unique baby names', note: 'Rare, meaningful picks' },
            { href: '/vintage-baby-names', label: 'Vintage names', note: 'Classics returning' },
            { href: '/biblical-baby-names', label: 'Biblical names', note: 'Scripture-rooted picks' },
            { href: '/blog', label: 'Naming guides', note: 'In-depth articles' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="card card-hover p-4">
              <span className="block text-sm font-bold text-nv-text">{l.label}</span>
              <span className="mt-0.5 block text-xs text-nv-text-muted">{l.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </UsPageShell>
  );
}
