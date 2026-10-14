// ─────────────────────────────────────────────────────────────────────────────
// Editorial identity, sourcing and methodology.
//
// E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is the
// single biggest lever on a reference site like this one. Google's quality
// raters look for four concrete things on a page, and this module supplies all
// four in one place so every US page renders them identically:
//
//   1. WHO wrote it        → AUTHOR / REVIEWER (a named entity, not "admin")
//   2. WHEN it changed     → LAST_UPDATED (a real date, not a build timestamp)
//   3. HOW the data is made→ METHODOLOGY (the actual pipeline, stated plainly)
//   4. WHERE facts come from→ SOURCES (named, linked, dated)
//
// ⚠️  OWNER ACTION REQUIRED — see REVIEWER below.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://nameverse.site';

// ── 1. Authorship ────────────────────────────────────────────────────────────
// The publishing entity. This is the organisation that stands behind the data.
export const PUBLISHER = {
  name: 'NameVerse',
  url: SITE_URL,
  logo: `${SITE_URL}/nameverse_logo_emblem.webp`,
  email: 'coding4443@gmail.com',
};

// ─────────────────────────────────────────────────────────────────────────────
// THE FOUNDER — the named human behind every page.
//
// This was previously the placeholder "NameVerse Editorial Team" with a note to
// replace it with a real, named person. It now is one, and it is the single
// source of truth for the byline on name pages, US pages, blog articles and the
// author/Person schema. Nothing about his identity is hardcoded anywhere else,
// so the About page, the Contact page, the footer credit and the structured
// data can never drift apart.
//
// E-E-A-T note: "who is responsible for this page" is the question a quality
// rater is asked to answer. A named founder with a bio, a location, a contact
// route and a demonstrable skill (he built the site and the dataset) answers it.
//
// ⚠️  PRIVACY NOTE FOR THE OWNER: email, phone and WhatsApp below are published
// publicly on /about and /contact and emitted in structured data. All three
// values live in this one object — edit them here, nowhere else.
// ─────────────────────────────────────────────────────────────────────────────
export const FOUNDER = {
  name: 'Zakriya Khan',
  givenName: 'Zakriya',
  familyName: 'Khan',
  role: 'Founder, full-stack developer & data author',
  // Shown as the one-line credential under the byline. Factual, verifiable
  // claims only: what he actually did on this project.
  credential: 'Designed and built NameVerse — the site, the database and the name API.',
  credentials:
    'Designed and built NameVerse end to end — the interface, the name database and the public name API — and maintains the pipeline that compiles and verifies every published profile.',
  location: {
    city: 'Pir Piai',
    district: 'Nowshera',
    region: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    countryCode: 'PK',
    label: 'Pir Piai, Nowshera, Khyber Pakhtunkhwa, Pakistan',
  },
  email: 'coding4443@gmail.com',
  phone: {
    e164: '+923497174815',
    international: '+92 349 7174815',
    local: '0349 7174815',
    // Dialable from a mobile browser.
    href: 'tel:+923497174815',
  },
  whatsapp: {
    label: 'WhatsApp',
    href: 'https://wa.me/923497174815',
  },
  // Public profiles. Kept short and real — a fabricated `sameAs` is worse than
  // none, so anything unverified stays out.
  sameAs: ['https://github.com/Zakriya-Khan-Full-Stack-Developer'],
  knowsAbout: [
    'Baby naming traditions',
    'Onomastics',
    'Islamic, Christian and Hindu given names',
    'Structured name data',
    'Full-stack web development',
    'Next.js and React',
  ],
  languages: ['English', 'Urdu', 'Pashto'],
  skills: [
    'Front-end engineering — Next.js 15, React 18, Tailwind CSS',
    'Back-end and data pipelines — Node.js, JSON APIs, build-time static generation',
    'Data modelling — a normalised name schema spanning four naming traditions',
    'Technical SEO — crawlability, structured data, sitemaps and indexation',
  ],
  story: [
    'I am Zakriya Khan, a full-stack web developer from Pir Piai, a town in the Nowshera district of Khyber Pakhtunkhwa, Pakistan. I built NameVerse on my own — the design, the front end, the database behind it and the public API that serves it.',
    'The project started from a problem close to home. Choosing a name in a family that cares about meaning is difficult when the sources for that meaning are scattered across language dictionaries, religious texts and word-of-mouth, and when the websites that collect them are either locked behind a paywall or padded with invented meanings. I wanted one place where an Islamic name, a Biblical name and a Sanskrit name could be looked up side by side, each with its meaning, origin, pronunciation and script form written down honestly.',
    'So I compiled the dataset myself — no scraped list, no anonymous dump. Every record carries a documented meaning and origin, and records that only contained a guess were kept out of the published set rather than padded into it with filler. I then wrote the software that turns those records into a fast, static website: one database, a build pipeline, and an API so anyone can build on the data instead of copying screenshots from it.',
    'I still maintain it myself: new entries, corrections, performance and keeping the site crawlable. If a meaning on this site is wrong, I would rather hear it from you — every correction is applied to the source record and fixes the page it appears on.',
  ],
};

// The byline shown on every editorial page. Kept as a separate export because
// the US, name and guide templates read `AUTHOR` directly.
export const AUTHOR = {
  name: FOUNDER.name,
  role: FOUNDER.role,
  credentials: FOUNDER.credentials,
  credential: FOUNDER.credential,
  email: FOUNDER.email,
  location: FOUNDER.location,
  bioUrl: `${SITE_URL}/about#founder`,
  // A named human being, not an organisation — that is the whole point of this
  // change, and the templates branch on it (Person vs Organization in schema).
  isOrganisation: false,
};

// ── 1b. Contact ──────────────────────────────────────────────────────────────
// One inbox, one phone number, and subject-line routing instead of role
// addresses that nobody reads and nobody can verify.
export const CONTACT = {
  email: FOUNDER.email,
  phone: FOUNDER.phone,
  whatsapp: FOUNDER.whatsapp,
  address: FOUNDER.location,
  foundedIn: FOUNDER.location.label,
  /** First reply window we are prepared to stand behind. */
  responseTime: 'Usually within 1–2 business days (Pakistan Standard Time, UTC+5).',
  correctionResponseTime: 'Name corrections are treated as the top priority and are usually reviewed within 48 hours.',
};

/** Build a mailto: link with a pre-filled subject (and optional body). */
export function mailto({ subject = '', body = '' } = {}) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT.email}${params.length ? `?${params.join('&')}` : ''}`;
}

/** Human-readable address on one line, for schema and the contact page. */
export const POSTAL_ADDRESS_SCHEMA = {
  '@type': 'PostalAddress',
  addressLocality: FOUNDER.location.city,
  addressRegion: FOUNDER.location.region,
  addressCountry: FOUNDER.location.countryCode,
};

// Optional expert reviewer. Leave `name` null to omit the reviewer line
// entirely — an empty reviewer slot is better than a fabricated one.
export const REVIEWER = {
  name: null, // e.g. 'Dr. A. Rahman, PhD Linguistics'
  credentials: null,
  bioUrl: null,
};

// ── 2. Freshness ─────────────────────────────────────────────────────────────
// A fixed, human-set date. Deliberately NOT `new Date()`: a build timestamp
// that changes on every deploy is a freshness signal Google learns to ignore,
// and it makes the "last updated" claim meaningless to a reader.
export const LAST_UPDATED = '2026-10-05';
export const LAST_UPDATED_LABEL = 'October 5, 2026';

// ── 3. Methodology ───────────────────────────────────────────────────────────
// Stated plainly, in the order the work actually happens. This is what
// separates a reference page from an aggregator.
export const METHODOLOGY = {
  title: 'How we compile and verify name data',
  intro:
    'Every figure on this page is traceable to a named source. We do not estimate, interpolate or round popularity data, and we do not publish a name profile until it carries a documented meaning and origin.',
  steps: [
    {
      title: 'National ranking data',
      body: 'Rankings are taken from the Social Security Administration national baby-name dataset, which is compiled from US birth records, and cross-checked against published 2026 ranking tables from BabyCenter. Where the two disagree we show both and say so.',
    },
    {
      title: 'Name profiles',
      body: 'Each of the 11,412 name profiles in the NameVerse database is built from a structured record containing meaning, origin, gender usage, script forms and pronunciation. Records missing a meaning or an origin are excluded from the index and from our sitemaps rather than published as thin pages.',
    },
    {
      title: 'Editorial review',
      body: 'Composed prose is generated from each record\u2019s own fields and then reviewed for accuracy. Belief-based associations \u2014 numerology, lucky numbers, letter symbolism \u2014 are labelled as traditional throughout and are never presented as linguistic fact.',
    },
    {
      title: 'Corrections',
      body: 'Errors are corrected at the source record, which updates every page that draws on it. Substantive corrections are noted on the editorial policy page.',
    },
  ],
};

// ── 4. Sources ───────────────────────────────────────────────────────────────
// Named, linked, dated. Rendered as a visible list AND as schema.org `citation`
// on the Article node, so the sourcing is machine-readable too.
export const SOURCES = {
  ssa: {
    name: 'Social Security Administration \u2014 Popular Baby Names',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/',
    note: 'National name rankings compiled from US birth records.',
  },
  ssaTop: {
    name: 'SSA \u2014 Top 10 Baby Names',
    publisher: 'US Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/index.html',
    note: 'Official national top-10 ranking, most recent release.',
  },
  babycenter: {
    name: 'BabyCenter \u2014 Most Popular Baby Names of 2026',
    publisher: 'BabyCenter',
    url: 'https://www.babycenter.com/baby-names/most-popular/top-baby-names-2026',
    note: 'Independent 2026 ranking table, used to cross-check SSA ordering.',
  },
  wikipedia: {
    name: 'Most popular given names by state in the United States',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/List_of_most_popular_given_names_by_state_in_the_United_States',
    note: 'State-level top-10 tables derived from the SSA state dataset.',
  },
  nameberry: {
    name: 'Nameberry \u2014 Baby Names 2026',
    publisher: 'Nameberry',
    url: 'https://nameberry.com',
    note: 'Used for trend direction and rising-name signals only, never for rankings.',
  },
};

// Convenience: the sources most US pages cite.
export const DEFAULT_SOURCE_KEYS = ['ssa', 'ssaTop', 'babycenter'];

export function resolveSources(keys = DEFAULT_SOURCE_KEYS) {
  return keys.map((k) => SOURCES[k]).filter(Boolean);
}

// ── Shared FAQ copy ──────────────────────────────────────────────────────────
// Reused across US pages so the answers stay consistent and citable.
export const EDITORIAL_FAQ = [
  {
    q: 'Where does NameVerse get its baby name data?',
    a: 'National rankings come from the Social Security Administration baby-name dataset, which is compiled from US birth records, and are cross-checked against BabyCenter\u2019s published 2026 ranking tables. Individual name profiles are built from NameVerse\u2019s own structured database of 11,412 records covering meaning, origin, gender usage, script forms and pronunciation.',
  },
  {
    q: 'How often is this page updated?',
    a: `This page is reviewed and updated when new national ranking data is released, and at minimum once per ranking cycle. The date shown at the top of the page is the date of the last substantive editorial review, not the date the page was last rebuilt.`,
  },
  {
    q: 'Are the lucky numbers and numerology on NameVerse factual?',
    a: 'No, and we label them clearly. Numerology, lucky numbers, lucky days and letter symbolism are traditional belief-based associations. They are presented as cultural context, never as linguistic or scientific fact. Meaning, origin and pronunciation are the fields we treat as factual and verify.',
  },
  {
    q: 'Why do some popular names not have a NameVerse profile?',
    a: 'We only publish a name profile when we hold a documented meaning and origin for it. Names that appear in national rankings but are not yet in our documented database are listed on our ranking pages without a profile link, rather than published as an empty page.',
  },
];

// ── About + Contact FAQ copy ─────────────────────────────────────────────────
// Rendered visibly on /about and /contact and emitted as FAQPage schema there.
// Every answer refers to a fact that is true of the repository: the founder's
// identity, the size of the dataset, the API endpoints, and the correction
// route. Nothing here is aspirational.
export const SITE_FAQ = [
  {
    q: 'Who owns and runs NameVerse?',
    a: 'NameVerse is built, owned and maintained by Zakriya Khan, a full-stack web developer from Pir Piai, Nowshera, Khyber Pakhtunkhwa, Pakistan. He designed the site, compiled the name database and wrote the API that serves it. You can reach him directly at coding4443@gmail.com or on +92 349 7174815.',
  },
  {
    q: 'How is NameVerse built?',
    a: 'The site is a Next.js application with no runtime database. The name records live as structured JSON, a build pipeline normalises and validates them, and every page — including all published name profiles — is generated as static HTML at build time and served from a CDN. That is why pages load fast and why a crawler cannot overload the server.',
  },
  {
    q: 'Does NameVerse have a free name API?',
    a: 'Yes. Individual records are published as JSON at /names/{tradition}/{name}.json and each tradition has a compact search index at /names/{tradition}/_search-index.json — for example /names/islamic/aaban.json. There is no key, no registration and no request limit on ordinary use; the files are static and served from the CDN.',
  },
  {
    q: 'How many names does NameVerse actually contain?',
    a: 'The published database contains 13,801 documented records across four traditions — Islamic, Christian, Hindu and Italian — of which 11,412 carry a documented meaning and origin and are published as indexable profiles. The remaining records are held back rather than padded into the index with filler, so the figures on this site are lower than the raw source count on purpose.',
  },
  {
    q: 'Is there a larger dataset than the one published on the site?',
    a: 'Yes, and the two figures measure different things. This site publishes 11,412 documented profiles as pages, drawn from 13,801 source records. The NameVerse name API additionally serves a wider cross-tradition collection of roughly 65,000 name records across Islamic, Christian, Hindu and other religious traditions, for search, autocomplete and research use. Those records are not yet published as pages here and are not counted in the published totals.',
  },
  {
    q: 'What does NameVerse do when a meaning is wrong?',
    a: 'Corrections are applied to the source record, which regenerates every page that draws on it, so a fix lands everywhere at once. Report a correction to coding4443@gmail.com with the name and what looks wrong; name corrections are usually reviewed within 48 hours.',
  },
  {
    q: 'Can I use the NameVerse data in my own project?',
    a: 'The name data is published to be read, cited and linked to. For anything beyond that — research, republishing or commercial use — write to coding4443@gmail.com describing what you want to do and you will get a straight answer about attribution and permitted use. Automated bulk redistribution of the database is not permitted.',
  },
];

const moduleApi = {
  PUBLISHER,
  AUTHOR,
  FOUNDER,
  CONTACT,
  POSTAL_ADDRESS_SCHEMA,
  mailto,
  REVIEWER,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
  METHODOLOGY,
  SOURCES,
  DEFAULT_SOURCE_KEYS,
  resolveSources,
  EDITORIAL_FAQ,
  SITE_FAQ,
};

export default moduleApi;
