import Link from 'next/link';
import PageJsonLd from '../../components/PageJsonLd.jsx';
import AdSlot from '../../components/AdSlot.jsx';
import { FOUNDER } from '../../lib/data/editorial.js';
import { pageMetadata } from '../../lib/seo.js';

export const metadata = pageMetadata({
  title: 'Contact NameVerse — Corrections & Feedback',
  description:
    'Contact NameVerse founder Zakriya Khan on WhatsApp or by email to report a name-meaning correction, suggest a topic or share feedback.',
  path: '/contact',
});

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact NameVerse',
  description: 'Contact NameVerse for feedback, corrections and suggestions.',
  url: 'https://nameverse.site/contact',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      name: FOUNDER.name,
      email: FOUNDER.email,
      telephone: FOUNDER.telephone,
      areaServed: 'Worldwide',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@nameverse.site',
      areaServed: 'Worldwide',
    },
  ],
};

export default function ContactPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageJsonLd data={contactJsonLd} />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-nv-text-secondary">
            Spotted an error in a meaning or origin? Want to suggest a name or a guide topic? Get in touch.
          </p>
        </header>

        <AdSlot placement="contact-top" />

        <section className="card mb-5 p-6 sm:p-8" aria-labelledby="direct-heading">
          <h2 id="direct-heading" className="font-display text-xl font-bold text-nv-text">
            Contact the founder directly
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
            NameVerse is run by{' '}
            <Link href="/about" className="font-semibold text-nv-accent hover:underline">{FOUNDER.name}</Link>. For
            corrections, questions or partnerships, the quickest routes are:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href={FOUNDER.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inset-panel block transition hover:border-nv-accent/60"
            >
              <span className="stat-label">WhatsApp</span>
              <span className="mt-1 block text-base font-bold text-nv-accent">{FOUNDER.whatsappDisplay}</span>
              <span className="mt-0.5 block text-xs text-nv-text-muted">International: {FOUNDER.whatsappInternational}</span>
            </a>
            <a href={`mailto:${FOUNDER.email}`} className="inset-panel block transition hover:border-nv-accent/60">
              <span className="stat-label">Email (Gmail)</span>
              <span className="mt-1 block break-all text-base font-bold text-nv-accent">{FOUNDER.email}</span>
              <span className="mt-0.5 block text-xs text-nv-text-muted">Please include the name and page you mean</span>
            </a>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">Corrections</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Meaning, origin or pronunciation errors are our top priority. Include the name and what looks wrong.
            </p>
            <a href="mailto:corrections@nameverse.site" className="mt-4 inline-block text-sm font-semibold text-nv-accent hover:underline">
              corrections@nameverse.site
            </a>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">General Feedback</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Ideas, feature requests and guide topic suggestions help shape what we build next.
            </p>
            <a href="mailto:hello@nameverse.site" className="mt-4 inline-block text-sm font-semibold text-nv-accent hover:underline">
              hello@nameverse.site
            </a>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">Privacy</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Questions about how we handle data — see our{' '}
              <Link href="/privacy" className="text-nv-accent hover:underline">
                privacy policy
              </Link>{' '}
              or write to us.
            </p>
            <a href="mailto:privacy@nameverse.site" className="mt-4 inline-block text-sm font-semibold text-nv-accent hover:underline">
              privacy@nameverse.site
            </a>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold text-nv-text">Legal</h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              Licensing, attribution and other legal matters.
            </p>
            <a href="mailto:legal@nameverse.site" className="mt-4 inline-block text-sm font-semibold text-nv-accent hover:underline">
              legal@nameverse.site
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
