import Link from 'next/link';
import { normalizeGender } from '../lib/data/name-utils.js';
import { getCanonicalSlug, isIndexableSlug } from '../lib/data/names-data.js';

// Tradition accent styling. Uses the design-system tokens so the card colours
// stay in sync with the rest of the site and remain AA-contrast in both themes.
const TRADITION_STYLES = {
  islamic: {
    bar: 'bg-islamic',
    badge: 'bg-islamic-soft text-islamic border-islamic-border',
  },
  christian: {
    bar: 'bg-christian',
    badge: 'bg-christian-soft text-christian border-christian-border',
  },
  hindu: {
    bar: 'bg-hindu',
    badge: 'bg-hindu-soft text-hindu border-hindu-border',
  },
  italian: {
    bar: 'bg-italian',
    badge: 'bg-italian-soft text-italian border-italian-border',
  },
};

const GENDER_STYLES = {
  boy: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/50 dark:text-sky-300',
  girl: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/50 dark:text-rose-300',
  unisex: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/50 dark:text-purple-300',
};

// `headingTag` defaults to a paragraph, not a heading. A listing page can hold
// 300 of these cards; as <h3> every one of them entered the document outline as
// a sibling section heading, so /origins/arabic, /islamic-boy-names and the
// letter hubs each shipped 300+ H3s under a single H2. Google reads that as a
// page with no discernible structure. The cards are list items, not sections —
// the H2 above the grid is the heading, and the name is the link text.
export default function NameCard({ item, showReligion = false, headingTag = 'p' }) {
  if (!item) return null;

  const meaning = item.short_meaning || item.meaning || '';
  // No recorded gender → no gender badge. It used to default to "Unisex",
  // which asserted a fact the record does not contain.
  const genderKey = normalizeGender(item.gender);
  const genderText = genderKey === 'boy' ? 'Boy' : genderKey === 'girl' ? 'Girl' : genderKey === 'unisex' ? 'Unisex' : null;
  const religion = item.religion || '';
  const luckyNumber = item.lucky_number ?? item.luckyNumber;
  const style = TRADITION_STYLES[religion] || {
    bar: 'bg-nv-accent',
    badge: 'bg-nv-accent-subtle text-nv-accent border-nv-border',
  };
  const Heading = headingTag;

  // FIX — only link to a URL that actually exists. NameChip and RankedNameList
  // already follow this rule ("a name we have no verified profile for is still
  // shown, but it never becomes a link to a page that does not exist"); NameCard
  // was the one component that linked unconditionally. Because the detail route
  // sets `dynamicParams = false`, every card pointing at a non-prerendered slug
  // was a hard 404 — 352 of them from the Italian set alone, published from the
  // homepage, the letter hubs, the tradition hubs, /names, /origins/italian,
  // /categories/italian and /trending-names.
  const targetSlug = getCanonicalSlug(religion, item.slug);
  const linkable = isIndexableSlug(religion, targetSlug);
  const Wrapper = linkable ? Link : 'div';
  const wrapperProps = linkable
    ? { href: `/names/${religion}/${targetSlug}`, prefetch: false }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={
        linkable
          ? 'card group relative flex flex-col overflow-hidden p-5 hover:-translate-y-1 hover:border-nv-accent/40 hover:shadow-card-hover'
          : 'card relative flex flex-col overflow-hidden p-5 border-dashed'
      }
    >
      <span className={`absolute left-0 top-0 h-1 w-full ${style.bar} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="flex items-start justify-between gap-3">
        <Heading className="font-display text-lg font-bold tracking-tight text-nv-text transition-colors group-hover:text-nv-accent">
          {item.name}
        </Heading>
        {genderText && (
          <span className={`badge shrink-0 border text-[11px] ${GENDER_STYLES[genderKey]}`}>
            {genderText}
          </span>
        )}
      </div>

      {meaning && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-nv-text-secondary">
          {meaning}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {showReligion && religion && (
          <span className={`badge border text-[10px] uppercase tracking-wide ${style.badge}`}>
            {religion}
          </span>
        )}
        {item.origin && (
          <span className="badge border border-nv-border bg-nv-subtle/80 text-[11px] text-nv-text-secondary">
            {item.origin}
          </span>
        )}
        {luckyNumber !== undefined && luckyNumber !== null && luckyNumber !== '' && (
          <span className="badge border border-amber-200/70 bg-amber-50/80 text-[11px] font-semibold text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
            &#9733; {luckyNumber}
          </span>
        )}
        {linkable ? (
          <span className="ml-auto text-xs font-semibold text-nv-accent opacity-0 transition-opacity group-hover:opacity-100">
            &rarr;
          </span>
        ) : (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-nv-text-muted">
            soon
          </span>
        )}
      </div>
    </Wrapper>
  );
}
