import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// NameVerse logo.
//
// WHY THIS EXISTS
// The NameVerse mark existed as a file (public/nameverse_logo_emblem.webp) and
// was referenced by the OpenGraph tags, the JSON-LD Organization schema and the
// sitemap-era metadata — but it was never rendered anywhere a user could see it.
// The navbar and footer both drew a plain letter "N" in a coloured square
// instead. So the brand was invisible on all ~12,600 pages: no logo in the
// header, none in the footer, no favicon, no apple-touch-icon.
//
// A recognisable mark matters directly for search: Google uses it in mobile
// SERPs and in Discover, and it is the anchor for the Organization entity that
// the JSON-LD already declares. It has to be visible and consistent.
//
// One component so the header, the footer and the 404 page cannot drift apart.
// ─────────────────────────────────────────────────────────────────────────────

export const LOGO_SRC = '/nameverse_logo_emblem.webp';
export const LOGO_ALT = 'NameVerse — baby names with meanings and origins';

export default function Logo({ size = 40, withWordmark = true, tagline = false, className = '' }) {
  return (
    <span className={`flex shrink-0 items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={size}
        height={size}
        decoding="async"
        // Above the fold in the header — never lazy-load it, and give it
        // priority so it paints with the wordmark instead of popping in.
        loading="eager"
        fetchPriority="high"
        className="shrink-0 rounded-xl"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-nv-text">
            NameVerse
          </span>
          {tagline && (
            <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-nv-text-muted sm:block">
              Baby Names &amp; Meanings
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** The header logo, linked home. */
export function HeaderLogo() {
  return (
    <Link href="/" className="group shrink-0" aria-label="NameVerse home">
      <Logo
        size={40}
        tagline
        className="transition-opacity group-hover:opacity-90 [&_span]:transition-colors [&_span]:group-hover:text-nv-accent"
      />
    </Link>
  );
}

/** The footer logo, linked home. */
export function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="NameVerse home">
      <Logo size={44} />
    </Link>
  );
}
