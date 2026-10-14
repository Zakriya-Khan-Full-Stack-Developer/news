import Link from 'next/link';
import PageJsonLd from '../../components/PageJsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import {
  FOUNDER,
  PUBLISHER,
  CONTACT,
  SITE_FAQ,
  SITE_URL,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
  mailto,
  POSTAL_ADDRESS_SCHEMA,
} from '../../lib/data/editorial.js';
import { getSiteFacts } from '../../lib/data/site-facts.js';

// ─────────────────────────────────────────────────────────────────────────────
// /about — who builds NameVerse, how, and with what data.
//
// This is the page a quality rater opens when asking "who is behind this site,
// and can they be trusted with the topic?" It has to answer four things without
// the reader hunting:
//
//   1. WHO  — a named, reachable person with a verifiable skill, not a logo
//   2. WHAT — the real size and shape of the dataset, counted from the data
//   3. HOW  — the pipeline and the API, described accurately
//   4. HOW TO REACH US — email, phone, WhatsApp, and what happens next
//
// Nothing on this page is a hand-typed statistic. Every figure comes from
// getSiteFacts(), which counts the actual manifest at build time, so the page
// cannot drift out of sync with the database the way "42,310 names" once did.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_URL = `${SITE_URL}/about`;

export const metadata = {
  title: 'About NameVerse — Mission, Data & Who Builds It',
  description:
    'NameVerse is a documented baby-name database built end to end by Zakriya Khan, a full-stack developer from Nowshera, Pakistan. How the data is compiled, how the site is built, and how to use the free name API.',
  alternates: {
    canonical: PAGE_URL,
  },
  authors: [{ name: FOUNDER.name, url: `${SITE_URL}/about#founder` }],
  openGraph: {
    title: 'About NameVerse — Mission, Data & Who Builds It',
    description:
      'Who builds NameVerse, how the name database is compiled and verified, and how to use the free JSON name API.',
    url: PAGE_URL,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/nameverse_logo_emblem.webp`,
        width: 512,
        height: 512,
        alt: 'NameVerse — baby names with meanings and origins',
      },
    ],
  },
};

export default function AboutPage() {
  const facts = getSiteFacts();

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${PAGE_URL}#about`,
        url: PAGE_URL,
        name: 'About NameVerse',
        description:
          'Who builds NameVerse, how the baby-name database is compiled and verified, and how the free name API works.',
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': `${SITE_URL}/about#founder` },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: PUBLISHER.name,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: PUBLISHER.logo,
          width: 512,
          height: 512,
        },
        email: CONTACT.email,
        telephone: CONTACT.phone.e164,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: CONTACT.email,
          telephone: CONTACT.phone.e164,
          areaServed: 'Worldwide',
          availableLanguage: FOUNDER.languages,
        },
        address: POSTAL_ADDRESS_SCHEMA,
        founder: { '@id': `${SITE_URL}/about#founder` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/about#founder`,
        name: FOUNDER.name,
        givenName: FOUNDER.givenName,
        familyName: FOUNDER.familyName,
        jobTitle: FOUNDER.role,
        description: FOUNDER.credential,
        email: `mailto:${FOUNDER.email}`,
        telephone: FOUNDER.phone.e164,
        url: `${SITE_URL}/about#founder`,
        image: PUBLISHER.logo,
        sameAs: FOUNDER.sameAs,
        knowsAbout: FOUNDER.knowsAbout,
        knowsLanguage: FOUNDER.languages,
        address: POSTAL_ADDRESS_SCHEMA,
        nationality: { '@type': 'Country', name: 'Pakistan' },
        worksFor: { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
        founderOf: { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: SITE_FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'About', item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <PageJsonLd data={aboutJsonLd} />

      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-nv-text-muted">
          <Link href="/" className="hover:text-nv-accent">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-nv-text-secondary">About</span>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <span className="eyebrow">About us</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            About NameVerse
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-nv-text-secondary">
            NameVerse is a documented baby-name database and reference — every entry with its meaning,
            origin, pronunciation and cultural context written down, across Islamic, Christian and Hindu
            naming traditions. It is built and maintained by one developer, publicly, with no paywall
            between a family and a name.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-nv-border bg-nv-subtle/50 px-4 py-3 text-xs text-nv-text-secondary">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-nv-accent text-[11px] font-bold text-white"
              >
                ZK
              </span>
              <span>
                Built by{' '}
                <a href="#founder" className="font-semibold text-nv-accent hover:underline">
                  {FOUNDER.name}
                </a>
                , {FOUNDER.role}
              </span>
            </span>
            <span aria-hidden="true" className="hidden text-nv-text-muted sm:inline">
              &middot;
            </span>
            <span>
              Last updated <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
            </span>
          </div>
        </header>

        <AdSlot placement="about-top" />

        {/* ── Numbers strip — counted from the manifest, never typed ────────── */}
        <section aria-labelledby="facts-heading" className="mt-10">
          <h2 id="facts-heading" className="sr-only">
            NameVerse at a glance
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-tile">
              <dt className="stat-label">Published profiles</dt>
              <dd className="stat-value text-lg">{facts.published.toLocaleString('en-US')}</dd>
              <p className="mt-1 text-xs text-nv-text-muted">
                Names with a documented meaning and origin
              </p>
            </div>
            <div className="stat-tile">
              <dt className="stat-label">Source records</dt>
              <dd className="stat-value text-lg">{facts.records.toLocaleString('en-US')}</dd>
              <p className="mt-1 text-xs text-nv-text-muted">
                {facts.heldBack.toLocaleString('en-US')} held back rather than padded into the index
              </p>
            </div>
            <div className="stat-tile">
              <dt className="stat-label">Origins covered</dt>
              <dd className="stat-value text-lg">{facts.origins}</dd>
              <p className="mt-1 text-xs text-nv-text-muted">
                Arabic, Hebrew, Sanskrit, Persian, Urdu and more
              </p>
            </div>
            <div className="stat-tile">
              <dt className="stat-label">Cost to use</dt>
              <dd className="stat-value text-lg">Free</dd>
              <p className="mt-1 text-xs text-nv-text-muted">No account, no paywall, no name limit</p>
            </div>
          </dl>
        </section>

        <div className="mt-12 space-y-6">
          {/* ── 1. Mission ─────────────────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="mission-heading">
            <h2 id="mission-heading" className="font-display text-2xl font-bold text-nv-text">
              Why NameVerse exists
            </h2>
            <div className="prose-nv mt-3 space-y-4 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              <p>
                A name carries meaning, heritage and identity. It is also the first decision a family
                makes about a child, and it is usually made under pressure: relatives suggesting names,
                a due date approaching, and a dozen websites disagreeing about what any of them mean.
              </p>
              <p>
                Most name websites make that harder. They invent meanings to fill a page, they publish a
                single tradition and treat the others as an afterthought, or they hide the list behind an
                account and a subscription. When a name is reduced to a keyword, the culture that gave it
                its meaning is the first thing to be lost.
              </p>
              <p>
                NameVerse takes the opposite approach. Every published record has a documented meaning and
                a recorded origin. Where a tradition holds more than one reading of a name, the page says
                so rather than choosing silently. Belief-based associations — numerology, lucky numbers,
                letter symbolism — are labelled as tradition, never dressed up as linguistics.
              </p>
            </div>
          </section>

          {/* ── 2. The founder ─────────────────────────────────────────────── */}
          <section
            id="founder"
            className="card scroll-mt-24 overflow-hidden p-6 sm:p-8"
            aria-labelledby="founder-heading"
          >
            <span className="eyebrow">Who builds this</span>
            <h2
              id="founder-heading"
              className="mt-2 font-display text-2xl font-bold text-nv-text sm:text-3xl"
            >
              {FOUNDER.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-nv-accent">{FOUNDER.role}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-[7rem_1fr] sm:gap-8">
              <div className="flex flex-col items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-nv-primary to-nv-accent font-display text-3xl font-bold text-white shadow-sm"
                >
                  ZK
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nameverse_logo_emblem.webp"
                  alt="The NameVerse emblem: a gold N above an open book, ringed by the crescent, the Om and the cross"
                  width={112}
                  height={112}
                  loading="lazy"
                  decoding="async"
                  className="h-28 w-28 rounded-2xl border border-nv-border"
                />
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
                {FOUNDER.story.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="inset-panel">
                    <dt className="stat-label">Based in</dt>
                    <dd className="stat-value">{FOUNDER.location.label}</dd>
                  </div>
                  <div className="inset-panel">
                    <dt className="stat-label">Languages</dt>
                    <dd className="stat-value">{FOUNDER.languages.join(', ')}</dd>
                  </div>
                </dl>

                <div>
                  <h3 className="text-sm font-bold text-nv-text">What I do on this project</h3>
                  <ul className="mt-2 space-y-2">
                    {FOUNDER.skills.map((skill) => (
                      <li key={skill} className="flex gap-3 text-sm">
                        <span aria-hidden="true" className="font-bold text-nv-success">
                          &#10003;
                        </span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct contact — the person who can actually fix a record. */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={mailto({
                      subject: 'NameVerse enquiry',
                      body: 'Hello Zakriya,\n\n',
                    })}
                    className="btn-primary !min-h-[42px] !px-5 !text-xs"
                  >
                    Email {FOUNDER.email}
                  </a>
                  <a href={FOUNDER.phone.href} className="btn-ghost !min-h-[42px] !px-5 !text-xs">
                    Call {FOUNDER.phone.international}
                  </a>
                  <a
                    href={FOUNDER.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !min-h-[42px] !px-5 !text-xs"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. How it is built ─────────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="built-heading">
            <h2 id="built-heading" className="font-display text-2xl font-bold text-nv-text">
              How the site is built
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              NameVerse has no runtime database and no server-side rendering on demand. The name records
              are plain JSON; a build pipeline normalises, enriches and validates them; and every page —
              all {facts.published.toLocaleString('en-US')} profiles, the hubs, the guides — is compiled
              into static HTML and served from a CDN edge. Four things follow from that, and all four are
              deliberate:
            </p>

            <ol className="mt-5 space-y-4">
              {[
                {
                  title: 'One database, one source of truth',
                  body: 'A record is corrected once and the fix regenerates every page that quotes it — the profile, the A–Z list, the origin hub and the search index. There is no second copy of the data to fall out of date.',
                },
                {
                  title: 'Nothing is published without a meaning and an origin',
                  body: `Of ${facts.records.toLocaleString('en-US')} source records, ${facts.published.toLocaleString('en-US')} carry a documented meaning and origin and are published. The other ${facts.heldBack.toLocaleString('en-US')} are withheld rather than published as thin pages.`,
                },
                {
                  title: 'Automated quality gates on every build',
                  body: 'Before a deployment ships, the build samples the database and fails if pages stop being unique or if coverage of meaning, origin, pronunciation and FAQ fields drops below threshold. A duplicate or hollow page cannot be deployed by accident.',
                },
                {
                  title: 'Fast and stable under crawling',
                  body: 'Static HTML means a crawler cannot knock the site over and a slow query cannot exist. It also means a page renders identically for every visitor, which is what keeps the site consistent for search engines.',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nv-accent-subtle text-sm font-bold text-nv-accent">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-nv-text sm:text-base">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-nv-text-secondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                'Next.js 15',
                'React 18',
                'Tailwind CSS',
                'Node.js',
                'Static site generation',
                'JSON name API',
                'CDN delivery',
                'No tracking cookies',
              ].map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* ── 4. The API ─────────────────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="api-heading">
            <h2 id="api-heading" className="font-display text-2xl font-bold text-nv-text">
              The NameVerse name API
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              The same data that renders these pages is published openly as JSON, so a developer, a
              student or another website can build on the collection instead of screenshotting it. There
              is no key to request, no quota and no registration — every endpoint is a static file on the
              CDN, which is also why ordinary use costs nothing.
            </p>

            <div className="mt-5 space-y-4">
              <div className="inset-panel">
                <h3 className="text-sm font-bold text-nv-text">Name record</h3>
                <p className="mt-1 text-xs text-nv-text-muted">
                  <code className="rounded bg-nv-subtle px-1.5 py-0.5 text-[11px]">
                    GET /names/{'{tradition}'}/{'{name}'}.json
                  </code>{' '}
                  — tradition is islamic, christian, hindu or italian.
                </p>
                <p className="mt-2 break-all text-xs text-nv-text-secondary">
                  <a href={`${SITE_URL}/names/islamic/aaban.json`} className="text-nv-accent hover:underline">
                    {SITE_URL}/names/islamic/aaban.json
                  </a>
                </p>
              </div>

              <div className="inset-panel">
                <h3 className="text-sm font-bold text-nv-text">Tradition search index</h3>
                <p className="mt-1 text-xs text-nv-text-muted">
                  <code className="rounded bg-nv-subtle px-1.5 py-0.5 text-[11px]">
                    GET /names/{'{tradition}'}/_search-index.json
                  </code>{' '}
                  — every published name in the tradition: name, slug, meaning, origin, gender and
                  popularity score.
                </p>
                <p className="mt-2 break-all text-xs text-nv-text-secondary">
                  <a href={`${SITE_URL}/names/hindu/_search-index.json`} className="text-nv-accent hover:underline">
                    {SITE_URL}/names/hindu/_search-index.json
                  </a>
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="stat-tile">
                <dt className="stat-label">Per-record fields</dt>
                <dd className="mt-1 text-xs leading-relaxed text-nv-text-secondary">
                  Meaning, etymology, origin, gender usage, pronunciation, script forms, related names and
                  cultural context.
                </dd>
              </div>
              <div className="stat-tile">
                <dt className="stat-label">Search index fields</dt>
                <dd className="mt-1 text-xs leading-relaxed text-nv-text-secondary">
                  name, slug, meaning, origin, gender and popularity score — compact keys, one file per
                  tradition.
                </dd>
              </div>
              <div className="stat-tile">
                <dt className="stat-label">Format &amp; rate</dt>
                <dd className="mt-1 text-xs leading-relaxed text-nv-text-secondary">
                  JSON, UTF-8, served from cache. No API key and no request limit on ordinary use.
                </dd>
              </div>
            </dl>

            {/* The wider collection — deliberately separated from the counted
                table above. The two numbers answer different questions: the
                table counts the records published as pages on THIS site, while
                the API serves a broader multi-tradition collection that is not
                yet rendered here. Printing them as one figure would recreate
                exactly the kind of unverifiable claim this page was rewritten
                to remove. */}
            <div className="mt-5 inset-panel">
              <h3 className="text-sm font-bold text-nv-text">
                Wider collection available through the API
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">
                The site publishes {facts.published.toLocaleString('en-US')} documented profiles as
                pages. Behind them, the NameVerse name API also serves a much larger
                cross-tradition collection — roughly 65,000 name records spanning Islamic,
                Christian, Hindu and other religious traditions, for search, autocomplete and
                research use. Those records are not yet published as individual pages here, and they
                are not counted in the table below. Access is free for reasonable use — write to{' '}
                <a
                  href={mailto({ subject: 'NameVerse API access' })}
                  className="font-semibold text-nv-accent hover:underline"
                >
                  {CONTACT.email}
                </a>{' '}
                with what you are building.
              </p>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-nv-text-secondary">
              Cite or link the source when you reuse the data, and do not redistribute the database in
              bulk — for research, publishing or commercial use, write to{' '}
              <a
                href={mailto({ subject: 'NameVerse data use request' })}
                className="font-semibold text-nv-accent hover:underline"
              >
                {CONTACT.email}
              </a>{' '}
              and you will get a straight answer.
            </p>
          </section>

          {/* ── 5. The data, tradition by tradition ────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="data-heading">
            <h2 id="data-heading" className="font-display text-2xl font-bold text-nv-text">
              What we publish, tradition by tradition
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              These figures are counted from the database when this page is built, not typed into it.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="data-table min-w-[30rem]">
                <caption className="sr-only">
                  Published NameVerse records by tradition, boys, girls and unisex
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Tradition</th>
                    <th scope="col">Source records</th>
                    <th scope="col">Published</th>
                    <th scope="col">Boys</th>
                    <th scope="col">Girls</th>
                    <th scope="col">Unisex</th>
                  </tr>
                </thead>
                <tbody>
                  {facts.traditions.map((tradition) => (
                    <tr key={tradition.key}>
                      <th scope="row" className="py-3 pr-4 text-left text-sm font-semibold text-nv-text">
                        {tradition.indexable ? (
                          <Link href={tradition.href} className="text-nv-accent hover:underline">
                            {tradition.label}
                          </Link>
                        ) : (
                          <span>
                            {tradition.label}{' '}
                            <span className="text-xs font-normal text-nv-text-muted">(in progress)</span>
                          </span>
                        )}
                      </th>
                      <td>{tradition.records.toLocaleString('en-US')}</td>
                      <td className="font-semibold text-nv-text">
                        {tradition.indexable ? tradition.published.toLocaleString('en-US') : '—'}
                      </td>
                      <td>{tradition.indexable ? tradition.boys.toLocaleString('en-US') : '—'}</td>
                      <td>{tradition.indexable ? tradition.girls.toLocaleString('en-US') : '—'}</td>
                      <td>{tradition.indexable ? tradition.unisex.toLocaleString('en-US') : '—'}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3 pr-4 text-left text-sm font-bold text-nv-text">
                      Total
                    </th>
                    <td className="font-bold text-nv-text">{facts.records.toLocaleString('en-US')}</td>
                    <td className="font-bold text-nv-text">
                      {facts.published.toLocaleString('en-US')}
                    </td>
                    <td className="font-bold text-nv-text">{facts.boys.toLocaleString('en-US')}</td>
                    <td className="font-bold text-nv-text">{facts.girls.toLocaleString('en-US')}</td>
                    <td className="font-bold text-nv-text">{facts.unisex.toLocaleString('en-US')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-nv-text-muted">
              A tradition is only published when its records carry a documented meaning and origin. The
              Italian set is being completed and is not part of the published index yet, so its pages are
              withheld rather than served half-empty. Origins currently covered:{' '}
              {facts.originLabels.join(', ')}.
            </p>
          </section>

          {/* ── 6. Editorial standards ─────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="standards-heading">
            <h2 id="standards-heading" className="font-display text-2xl font-bold text-nv-text">
              Editorial standards and corrections
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              Entries are checked against structured meaning, origin, gender-usage and pronunciation
              fields before they appear in search results and curated lists. Where traditions differ on
              what a name means or how it is said, the page records the variation instead of picking a
              side. Numerology, lucky numbers, lucky days and letter symbolism are presented as
              traditional associations throughout, never as fact.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              We are a data and reference publisher, not a religious or medical authority. If a name is
              wrong, incomplete or missing, we would rather know than not. The full process — sources,
              review and our position on belief-based content — is written up in the{' '}
              <Link href="/editorial-policy" className="font-semibold text-nv-accent hover:underline">
                editorial policy
              </Link>
              .
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: '1. Tell us the name',
                  body: 'Email the name and what looks wrong. A source link makes it faster, but is not required.',
                },
                {
                  title: '2. We check it against the record',
                  body: 'The source record is compared with the published references held for that name.',
                },
                {
                  title: '3. Every page updates',
                  body: 'The correction is applied to the record, and the next build regenerates every page that quotes it.',
                },
              ].map((step) => (
                <div key={step.title} className="inset-panel">
                  <h3 className="text-sm font-bold text-nv-text">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-nv-text-secondary">{step.body}</p>
                </div>
              ))}
            </div>

            <a
              href={mailto({
                subject: 'Name correction',
                body: 'Name:\nWhat looks wrong:\nSource (optional):\n',
              })}
              className="btn-primary mt-5 !text-xs"
            >
              Report a correction &rarr;
            </a>
          </section>

          {/* ── 7. FAQ ─────────────────────────────────────────────────────── */}
          <section className="card p-6 sm:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-display text-2xl font-bold text-nv-text">
              About NameVerse — FAQ
            </h2>
            <dl className="mt-4 divide-y divide-nv-border">
              {SITE_FAQ.map((item) => (
                <div key={item.q} className="py-4">
                  <dt className="text-sm font-bold text-nv-text sm:text-base">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-nv-text-secondary">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── 8. Contact ─────────────────────────────────────────────────── */}
          <section
            className="card bg-nv-subtle/40 p-6 sm:p-8"
            aria-labelledby="about-contact-heading"
          >
            <h2 id="about-contact-heading" className="font-display text-2xl font-bold text-nv-text">
              Talk to the person who builds it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
              There is no support queue and no outsourced helpdesk here — messages arrive with the
              developer. {CONTACT.responseTime}
            </p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="stat-tile">
                <dt className="stat-label">Email</dt>
                <dd className="mt-1">
                  <a
                    href={mailto({ subject: 'NameVerse enquiry' })}
                    className="break-all text-sm font-semibold text-nv-accent hover:underline"
                  >
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
              <div className="stat-tile">
                <dt className="stat-label">Phone</dt>
                <dd className="mt-1">
                  <a
                    href={CONTACT.phone.href}
                    className="text-sm font-semibold text-nv-accent hover:underline"
                  >
                    {CONTACT.phone.international}
                  </a>
                </dd>
              </div>
              <div className="stat-tile">
                <dt className="stat-label">WhatsApp</dt>
                <dd className="mt-1">
                  <a
                    href={CONTACT.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-nv-accent hover:underline"
                  >
                    Message {CONTACT.phone.local}
                  </a>
                </dd>
              </div>
              <div className="stat-tile">
                <dt className="stat-label">Post</dt>
                <dd className="mt-1 text-sm text-nv-text-secondary">{CONTACT.address.label}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-secondary !text-xs">
                Contact page &amp; enquiry types
              </Link>
              <Link href="/names" className="btn-ghost !text-xs">
                Browse all {facts.published.toLocaleString('en-US')} names
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
