import Link from 'next/link';
import PageJsonLd from '../../components/PageJsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import {
  FOUNDER,
  CONTACT,
  PUBLISHER,
  SITE_URL,
  SITE_FAQ,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
  mailto,
  POSTAL_ADDRESS_SCHEMA,
} from '../../lib/data/editorial.js';
import { getSiteFacts } from '../../lib/data/site-facts.js';

// ─────────────────────────────────────────────────────────────────────────────
// /contact — how to actually reach the person who maintains the database.
//
// The page previously listed four role addresses on the nameverse.site domain
// (corrections@, hello@, privacy@, legal@) with no form, no phone and no human
// behind them. A contact page whose inboxes may not be read is worse than no
// contact page: it is an E-E-A-T liability and it is exactly what a quality
// rater is checking for.
//
// Now there is one real inbox, one real phone number, WhatsApp, and a stated
// reply window. Every enquiry type is a pre-filled subject line so the mail
// arrives already organised, instead of a different address nobody monitors.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_URL = `${SITE_URL}/contact`;

export const metadata = {
  title: 'Contact NameVerse — Corrections, Data & Feedback',
  description:
    'Contact NameVerse directly: name corrections, data and API questions, licensing and feedback. Email coding4443@gmail.com, call or message +92 349 7174815, or use WhatsApp. Replies usually within 1–2 business days.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Contact NameVerse — Corrections, Data & Feedback',
    description:
      'Reach the developer behind NameVerse directly by email, phone or WhatsApp for corrections, data questions and feedback.',
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

// Enquiry types. Each one is a real destination with a pre-filled subject, so
// nothing depends on an address that might not exist.
const ENQUIRIES = [
  {
    id: 'correction',
    title: 'Report a name correction',
    blurb:
      'A meaning, origin, pronunciation or gender usage that looks wrong — or a name we have mislabelled.',
    subject: 'Name correction — NameVerse',
    body: 'Name (and tradition, if you know it):\nWhat looks wrong:\nCorrect information:\nSource or reference (optional):\n',
    meta: 'Priority — usually reviewed within 48 hours',
    icon: '✎',
  },
  {
    id: 'missing',
    title: 'Suggest a missing name',
    blurb:
      'A name that should be in the database, with the meaning and origin you know it by. Traditional and regional names are especially welcome.',
    subject: 'Name suggestion — NameVerse',
    body: 'Name:\nTradition:\nMeaning:\nOrigin / language:\nReference (optional):\n',
    meta: 'Reviewed with the next data update',
    icon: '＋',
  },
  {
    id: 'api',
    title: 'Data or API question',
    blurb:
      'Using the JSON endpoints, building on the dataset, or asking whether a specific field is available.',
    subject: 'Data / API question — NameVerse',
    body: 'What I am building:\nThe endpoint or field I need:\nQuestion:\n',
    meta: 'Technical — answered by the developer',
    icon: '{ }',
  },
  {
    id: 'licensing',
    title: 'Licensing & permission',
    blurb:
      'Republishing data, research use, or commercial use of the name records in your own product.',
    subject: 'Data use / licensing request — NameVerse',
    body: 'Who I am:\nWhat I want to do with the data:\nWhere it will be published:\n',
    meta: 'Every request gets a clear yes or no',
    icon: '§',
  },
  {
    id: 'bug',
    title: 'Report a bug or accessibility issue',
    blurb:
      'A broken page, a search that returns nothing it should, a layout problem, or something that does not work with a screen reader.',
    subject: 'Site issue — NameVerse',
    body: 'Page URL:\nDevice / browser:\nWhat happened:\nWhat I expected:\n',
    meta: 'Usually fixed in the next deployment',
    icon: '!',
  },
  {
    id: 'feedback',
    title: 'General feedback & ideas',
    blurb:
      'A guide topic you would like covered, a feature that would help, or simply a note about how the site worked for you.',
    subject: 'Feedback — NameVerse',
    body: '',
    meta: 'Read by the founder, not a bot',
    icon: '☺',
  },
];

export default function ContactPage() {
  const facts = getSiteFacts();

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${PAGE_URL}#contact`,
        url: PAGE_URL,
        name: 'Contact NameVerse',
        description:
          'Contact NameVerse for name corrections, missing names, data and API questions, licensing and feedback.',
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': `${PAGE_URL}#contact-point` },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'ContactPoint',
        '@id': `${PAGE_URL}#contact-point`,
        contactType: 'customer support',
        name: FOUNDER.name,
        email: CONTACT.email,
        telephone: CONTACT.phone.e164,
        url: PAGE_URL,
        contactOption: 'TollFree',
        areaServed: 'Worldwide',
        availableLanguage: FOUNDER.languages,
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '19:00',
        },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/about#founder`,
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
        email: `mailto:${FOUNDER.email}`,
        telephone: FOUNDER.phone.e164,
        address: POSTAL_ADDRESS_SCHEMA,
        url: `${SITE_URL}/about#founder`,
        sameAs: FOUNDER.sameAs,
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
          { '@type': 'ListItem', position: 2, name: 'Contact', item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <PageJsonLd data={contactJsonLd} />

      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-nv-text-muted">
          <Link href="/" className="hover:text-nv-accent">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-nv-text-secondary">Contact</span>
        </nav>

        <header className="mb-8">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Contact NameVerse
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-nv-text-secondary">
            Spotted a meaning that looks wrong, a name we are missing, or a page that will not load?
            Messages here arrive with the developer who maintains the database, not a support queue.
          </p>
        </header>

        <AdSlot placement="contact-top" />

        {/* ── Primary contact block ─────────────────────────────────────────── */}
        <section
          className="mt-10 card p-6 sm:p-8"
          aria-labelledby="direct-heading"
        >
          <h2 id="direct-heading" className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            Reach {FOUNDER.name} directly
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="inset-panel">
              <p className="stat-label">Email — best for corrections and detailed questions</p>
              <a
                href={mailto({ subject: 'NameVerse enquiry', body: 'Hello Zakriya,\n\n' })}
                className="mt-2 block break-all text-base font-bold text-nv-accent hover:underline"
              >
                {CONTACT.email}
              </a>
              <p className="mt-1 text-xs text-nv-text-muted">{CONTACT.responseTime}</p>
            </div>

            <div className="inset-panel">
              <p className="stat-label">Phone — call or WhatsApp</p>
              <a
                href={CONTACT.phone.href}
                className="mt-2 block text-base font-bold text-nv-accent hover:underline"
              >
                {CONTACT.phone.international}
              </a>
              <p className="mt-1 text-xs text-nv-text-muted">
                Monday to Saturday, 10:00–19:00 Pakistan Standard Time (UTC+5).{' '}
                <a
                  href={CONTACT.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-nv-accent hover:underline"
                >
                  Message on WhatsApp
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-nv-text-secondary">
            <span>
              <span className="font-semibold text-nv-text">Based in:</span> {CONTACT.address.label}
            </span>
            <span>
              <span className="font-semibold text-nv-text">Responds in:</span> {FOUNDER.languages.join(', ')}
            </span>
            <span>
              <span className="font-semibold text-nv-text">Last updated:</span>{' '}
              <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
            </span>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-nv-text-muted">
            Please report a name correction rather than fixing it silently elsewhere — the correction is
            applied to the source record and regenerates every page that quotes it, so one email fixes
            the profile, the A–Z listing, the origin hub and the search index at once.
          </p>
        </section>

        {/* ── Enquiry types ─────────────────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="enquiry-heading">
          <h2 id="enquiry-heading" className="font-display text-2xl font-bold text-nv-text">
            What are you getting in touch about?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary sm:text-base">
            Each option below opens your mail app with the subject and a short template already filled
            in, so nothing important gets left out and nothing has to be explained twice.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {ENQUIRIES.map((enquiry) => (
              <section key={enquiry.id} className="card card-hover flex flex-col p-6">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-nv-accent-subtle text-sm font-bold text-nv-accent"
                >
                  {enquiry.icon}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-nv-text">{enquiry.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-nv-text-secondary">
                  {enquiry.blurb}
                </p>
                <p className="mt-3 text-xs font-semibold text-nv-success">{enquiry.meta}</p>
                <a
                  href={mailto({ subject: enquiry.subject, body: enquiry.body })}
                  className="btn-ghost mt-4 !min-h-[42px] !text-xs"
                >
                  Open email template &rarr;
                </a>
              </section>
            ))}
          </div>
        </section>

        {/* ── Self-service shortcuts ────────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="shortcuts-heading">
          <h2 id="shortcuts-heading" className="font-display text-2xl font-bold text-nv-text">
            Answers you can get without waiting
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'How do you choose what to publish?',
                body: 'Sources, verification and our position on numerology are all set out in the editorial policy.',
                href: '/editorial-policy',
                label: 'Read the editorial policy',
              },
              {
                title: `Where are the ${facts.published.toLocaleString('en-US')} names?`,
                body: 'Browse by tradition, gender, origin, meaning or the full A–Z letter index.',
                href: '/names',
                label: 'Browse the directory',
              },
              {
                title: 'Can I build on your data?',
                body: 'The JSON endpoints, the fields they return and the usage terms are documented on the About page.',
                href: '/about#api-heading',
                label: 'See the API docs',
              },
              {
                title: 'How is a name verified?',
                body: 'The pipeline that turns a source record into a published profile, explained plainly.',
                href: '/about#built-heading',
                label: 'How the site is built',
              },
              {
                title: 'Something is not working on my device',
                body: 'Use the bug template above with the page URL and browser — that is usually enough to reproduce it.',
                href: '/about#faq-heading',
                label: 'About NameVerse FAQ',
              },
              {
                title: 'Do you handle press or research requests?',
                body: 'Send the deadline and what you need — statistics, quotes or a data extract — through the licensing template.',
                href: '/popular-names-2026',
                label: 'See the sourced rankings',
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <h3 className="text-sm font-bold text-nv-text sm:text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-3 inline-block text-xs font-semibold text-nv-accent hover:underline"
                >
                  {item.label} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact FAQ ───────────────────────────────────────────────────── */}
        <section className="mt-12 card p-6 sm:p-8" aria-labelledby="contact-faq-heading">
          <h2 id="contact-faq-heading" className="font-display text-2xl font-bold text-nv-text">
            Contact questions
          </h2>
          <dl className="mt-4 divide-y divide-nv-border">
            {[
              {
                q: 'How quickly will I hear back?',
                a: `${CONTACT.responseTime} ${CONTACT.correctionResponseTime} The site is maintained by one developer, so a detailed question sometimes takes longer than a one-line correction — but every message is read.`,
              },
              {
                q: 'Is there a contact form?',
                a: 'No. A form adds a queue and a spam filter between you and the answer, and it needs a server to run. Email, phone and WhatsApp reach the same person with fewer steps, and the templates above fill themselves in so you do not have to write the structure out yourself.',
              },
              {
                q: 'What should I include in a correction?',
                a: 'The name, the tradition if you know it, what the page currently says, what it should say, and a reference if you have one. Even without a reference it is worth sending — a correction with no source still starts the check.',
              },
              {
                q: 'Can I request a name that is not in the database?',
                a: `Yes, and it is one of the most useful things you can send. Include the meaning and origin as you know them. The database currently holds ${facts.records.toLocaleString('en-US')} source records, ${facts.published.toLocaleString('en-US')} of which are published; suggestions are added to the source set rather than published unverified.`,
              },
              {
                q: 'Do you answer questions about a specific child’s name choice?',
                a: 'No. This is a reference publisher, not an advisory service — the decision belongs to your family, and a website should not pretend to make it. What we can do is make sure the meaning, origin and usage you are looking at are accurate.',
              },
              {
                q: 'Will you publish my email address or message?',
                a: 'No. Corrections are applied silently to the data; your message is not published, quoted or credited unless you explicitly ask us to.',
              },
            ].map((item) => (
              <div key={item.q} className="py-4">
                <dt className="text-sm font-bold text-nv-text sm:text-base">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-nv-text-secondary">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Closing ───────────────────────────────────────────────────────── */}
        <section className="mt-12 rounded-bento border border-nv-border bg-nv-subtle/40 p-6 text-center sm:p-8">
          <h2 className="font-display text-xl font-bold text-nv-text sm:text-2xl">
            One inbox, one person, no ticket numbers
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-nv-text-secondary">
            {PUBLISHER.name} is maintained by {FOUNDER.name} in {CONTACT.address.city},{' '}
            {CONTACT.address.region}, Pakistan. Whether it is a wrong meaning or a page that will not
            load, writing in directly is the fastest route to a fix.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={mailto({ subject: 'NameVerse enquiry' })}
              className="btn-primary !text-xs"
            >
              {CONTACT.email}
            </a>
            <a href={CONTACT.phone.href} className="btn-ghost !text-xs">
              {CONTACT.phone.international}
            </a>
            <Link href="/about" className="btn-ghost !text-xs">
              About the project
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
