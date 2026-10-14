import Link from 'next/link';
import AdSlot from '../../../components/AdSlot.jsx';
import { AUTHOR, EDITORIAL_FAQ, LAST_UPDATED, PUBLISHER } from '../../../lib/data/editorial.js';

const SITE_URL = 'https://nameverse.site';
const PAGE_URL = `${SITE_URL}/guides/expert-naming-guide`;
const TITLE = 'How to Choose a Baby Name — A Practical Naming Guide';
const DESCRIPTION =
  'A practical, culture-aware framework for choosing a baby name: meaning, origin, pronunciation, family context, popularity and a final shortlist test.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
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

const STEPS = [
  {
    number: '01',
    title: 'Write down the non-negotiables',
    body: 'Start with the constraints that will actually affect your family: a religious or cultural connection, a family namesake, a preferred starting sound, a language the name must work in, or a meaning you want to carry. Keep the list short. A name that satisfies every possible preference usually does not exist, but a name that satisfies the two or three that matter most can be a strong choice.',
  },
  {
    number: '02',
    title: 'Check the meaning and source language',
    body: 'Do not rely on a one-line slogan copied between name lists. Check what the word means in its source language, whether the origin is documented, and whether the religious or cultural label describes usage rather than etymology. NameVerse keeps meaning, origin and tradition as separate fields because an Arabic name is not automatically a Quranic name, and a Sanskrit name is not a complete description of Hindu usage.',
  },
  {
    number: '03',
    title: 'Say it with the surname',
    body: 'Say the full name at normal speaking speed, then say it as a teacher, doctor or receptionist might. Test the initials, rhythm, repeated sounds and likely nicknames. If your family uses more than one language, ask fluent speakers to read the intended spelling without coaching. A name that looks familiar in English may have a different stress pattern or sound in another language.',
  },
  {
    number: '04',
    title: 'Review spelling, script and variants',
    body: 'Many names travel through transliteration, translation and regional pronunciation. Several Latin spellings may represent one Arabic, Hebrew, Sanskrit or Greek form. Decide which spelling is most honest to your family and practical for your child, then record the original script when it matters. A variant is not necessarily an error; it may reflect a real community or language tradition.',
  },
  {
    number: '05',
    title: 'Ask the people who share the tradition',
    body: 'A database can describe a meaning and show a documented origin, but family and community knowledge adds lived context. Ask whether the name has an unwanted association, whether the pronunciation feels natural, and whether a ceremony or naming custom affects the choice. This is especially important for names connected with scripture, saints, deities, ancestors or regional history.',
  },
  {
    number: '06',
    title: 'Use popularity as context, not a verdict',
    body: 'Popularity data can tell you whether a spelling is familiar in a particular country or dataset. It cannot tell you whether a name is spiritually right for your family, whether a meaning is accurate, or whether a trend will last. Compare the source and year behind a ranking, and treat NameVerse scores as discovery aids rather than official forecasts.',
  },
  {
    number: '07',
    title: 'Separate tradition from fact',
    body: 'Numerology, lucky numbers, gemstones, colours and letter symbolism can be meaningful cultural practices for some families. They are belief-based associations, not linguistic or scientific evidence. Use them as an optional part of a naming conversation; make meaning, origin, pronunciation and family context the factual core of your decision.',
  },
  {
    number: '08',
    title: 'Keep a final shortlist for one week',
    body: 'Choose three to five finalists and use each in ordinary sentences: calling the child in from another room, writing it on a form, introducing the full name and saying it with the surname. Notice which name remains comfortable after the excitement fades. Then confirm the spelling, consult the relevant family or faith authority if needed, and make the decision without chasing every new list.',
  },
];

const FAQS = [
  {
    q: 'What is the most important factor when choosing a baby name?',
    a: 'There is no universal first factor. Meaning, cultural connection, pronunciation, family history and practical spelling all matter, but the right priority depends on your family. Start by identifying the two or three constraints you will not compromise on.',
  },
  {
    q: 'How many names should be on a final shortlist?',
    a: 'Three to five names is usually enough to compare without creating decision fatigue. Give each finalist a full-name test and check the source meaning, origin, spelling and pronunciation before narrowing further.',
  },
  {
    q: 'Should I choose a popular name or a rare name?',
    a: 'Choose the name that fits your family rather than optimizing for a ranking position. Popularity is useful context about familiarity and spelling, while a less common name may carry a stronger family or cultural connection.',
  },
  {
    q: 'Where can I check a name on NameVerse?',
    a: 'Start with the searchable directory or browse by tradition, meaning and origin. Published profiles carry a documented meaning and origin; verification-pending records remain outside the index rather than being presented as complete profiles.',
  },
  ...EDITORIAL_FAQ.slice(2, 4),
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${PAGE_URL}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      datePublished: LAST_UPDATED,
      dateModified: LAST_UPDATED,
      author: { '@type': AUTHOR.isOrganisation ? 'Organization' : 'Person', name: AUTHOR.name, url: AUTHOR.bioUrl },
      publisher: {
        '@type': 'Organization',
        name: PUBLISHER.name,
        url: PUBLISHER.url,
        logo: { '@type': 'ImageObject', url: PUBLISHER.logo },
      },
      mainEntityOfPage: { '@id': `${PAGE_URL}#webpage` },
      image: `${SITE_URL}/nameverse_logo_emblem.webp`,
      citation: `${SITE_URL}/editorial-policy`,
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      name: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
  ],
};

export default function ExpertNamingGuidePage() {
  return (
    <article className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-nv-text-muted">
          <Link href="/" className="hover:text-nv-accent">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-nv-accent">Guides</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-nv-text-secondary">Naming guide</span>
        </nav>

        <header className="mb-8">
          <span className="eyebrow">Practical naming framework</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-nv-text-secondary sm:text-lg">
            A name can be beautiful and still be the wrong fit for a family. This guide gives you a
            repeatable way to compare meaning, heritage, sound, spelling and real-world use without
            reducing a cultural tradition to a trend list.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-nv-text-muted">
            By <Link href={AUTHOR.bioUrl} className="font-semibold text-nv-accent hover:underline">{AUTHOR.name}</Link>
            {' '}&mdash; {AUTHOR.credentials}. Last reviewed <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>.
          </p>
        </header>

        <AdSlot placement="guide-top" />

        <section className="card mb-8 bg-nv-subtle/50 p-6 sm:p-8" aria-labelledby="quick-start-heading">
          <h2 id="quick-start-heading" className="font-display text-2xl font-bold text-nv-text">The short version</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            <li><strong className="text-nv-text">1.</strong> Decide which cultural, family or meaning constraints matter most.</li>
            <li><strong className="text-nv-text">2.</strong> Verify the source language, meaning, spelling and pronunciation.</li>
            <li><strong className="text-nv-text">3.</strong> Ask people who share the tradition about lived context.</li>
            <li><strong className="text-nv-text">4.</strong> Use popularity data as context, then test a short list in daily life.</li>
          </ol>
        </section>

        <div className="space-y-8">
          {STEPS.map((step) => (
            <section key={step.number} aria-labelledby={`step-${step.number}`}>
              <div className="flex items-start gap-4">
                <span className="mt-1 shrink-0 font-display text-lg font-bold text-nv-accent">{step.number}</span>
                <div>
                  <h2 id={`step-${step.number}`} className="font-display text-xl font-bold tracking-tight text-nv-text sm:text-2xl">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-nv-text-secondary sm:text-base">{step.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Continue the comparison
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/names-by-meaning" className="card card-hover p-5">
              <span className="font-display text-lg font-bold text-nv-text">Browse by meaning</span>
              <span className="mt-1 block text-sm text-nv-text-secondary">Start with a quality, blessing or feeling.</span>
            </Link>
            <Link href="/origins" className="card card-hover p-5">
              <span className="font-display text-lg font-bold text-nv-text">Browse by origin</span>
              <span className="mt-1 block text-sm text-nv-text-secondary">Compare language and cultural roots.</span>
            </Link>
            <Link href="/popularity" className="card card-hover p-5">
              <span className="font-display text-lg font-bold text-nv-text">Compare names</span>
              <span className="mt-1 block text-sm text-nv-text-secondary">Put a shortlist side by side.</span>
            </Link>
            <Link href="/editorial-policy" className="card card-hover p-5">
              <span className="font-display text-lg font-bold text-nv-text">Read our policy</span>
              <span className="mt-1 block text-sm text-nv-text-secondary">See how records and claims are handled.</span>
            </Link>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display text-2xl font-bold tracking-tight text-nv-text sm:text-3xl">
            Naming questions
          </h2>
          <div className="mt-5 space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-nv-border bg-nv-surface p-5">
                <summary className="cursor-pointer list-none font-semibold text-nv-text group-open:text-nv-accent">
                  {faq.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
