import Link from 'next/link';
import {
  AUTHOR,
  CONTACT,
  LAST_UPDATED,
  LAST_UPDATED_LABEL,
} from '../lib/data/editorial.js';

/**
 * A compact, visible trust signal for a name profile.
 *
 * Name pages should not repeat the full US-page methodology block: that would
 * add a large identical footer to thousands of documents. This keeps the
 * important E-E-A-T facts visible while sending readers to the complete policy.
 *
 * HONESTY NOTE — this block used to say "Last reviewed {site date}" on every
 * one of the 11,412 profiles. No per-profile review date exists, so a single
 * global date presented as a review of THIS record overstated what happened.
 * The date shown is now labelled for what it is: the date the site-wide
 * methodology was last updated.
 */
export default function NameTrustMeta({ name, origin, meaning }) {
  return (
    <aside className="rounded-2xl border border-nv-border bg-nv-subtle/50 p-5 sm:p-6" aria-label="Editorial information">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-nv-text-muted">
        <span className="font-semibold text-nv-text">
          By{' '}
          <Link href="/about#founder" className="hover:text-nv-accent hover:underline">
            {AUTHOR.name}
          </Link>
        </span>
        <span aria-hidden="true">&bull;</span>
        <span>
          Site methodology updated <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
        </span>
        <span aria-hidden="true">&bull;</span>
        <a
          href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Correction: ${name}`)}`}
          className="font-semibold hover:text-nv-accent hover:underline"
        >
          Report an error in {name}
        </a>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-nv-text-secondary">
        This {name} profile is assembled from a structured name record with a recorded meaning
        {origin ? ` and a recorded ${origin} origin` : ''}. The meaning shown here is “{meaning}”. Individual
        source citations are still being added to profiles, so check important details with a naming reference or
        your community. Numerology and letter symbolism are cultural interpretations, not linguistic evidence.
      </p>
      <Link href="/editorial-policy" className="mt-3 inline-flex text-sm font-semibold text-nv-accent hover:underline">
        Read how NameVerse researches and corrects profiles &rarr;
      </Link>
    </aside>
  );
}
