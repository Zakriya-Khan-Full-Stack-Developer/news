// ─────────────────────────────────────────────────────────────────────────────
// Page-level metadata builder.
//
// WHY THIS EXISTS
// Next.js merges `metadata` shallowly: a page that sets `title` and
// `description` but no `openGraph` / `twitter` inherits those objects from the
// root layout wholesale. Before this helper, ~25 pages (search, about, blog
// index, privacy, tradition hubs, letter pages …) shared the HOMEPAGE og:title,
// og:description and og:url, so every share card and every social crawler saw
// the homepage instead of the page being shared.
//
// Every route now builds its metadata through `pageMetadata()`, which always
// emits a page-specific canonical, Open Graph block and Twitter card. The
// title goes through the root `%s | NameVerse` template exactly once — callers
// must pass the bare title, never one that already ends in "| NameVerse".
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://nameverse.site';
export const SITE_NAME = 'NameVerse';

// 1200×630 brand card (summary_large_image / Open Graph recommended size).
export const DEFAULT_SHARE_IMAGE = {
  url: `${SITE_URL}/og-default.png`,
  width: 1200,
  height: 630,
  alt: 'NameVerse — baby names with meanings, origins and cultural context',
};

export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path).replace(/\/+$/, '');
  if (clean === '' || clean === '/') return SITE_URL;
  return `${SITE_URL}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

// Strip a trailing brand suffix so the root title template can never produce
// "Title | NameVerse | NameVerse".
export function bareTitle(title = '') {
  return String(title)
    .replace(/\s*[|\u2014\u2013-]\s*NameVerse(?:\s+Blog)?\s*$/i, '')
    .trim();
}

/**
 * Build a complete, page-specific metadata object.
 *
 * @param {object}  opts
 * @param {string}  opts.title         Bare page title (template adds the brand).
 * @param {string}  opts.description   Meta description (aim for ≤ 155 chars).
 * @param {string}  opts.path          Route path, e.g. '/about'.
 * @param {string} [opts.socialTitle]  Optional alternative title for share cards.
 * @param {string} [opts.type]         'website' (default) or 'article'.
 * @param {object} [opts.image]        { url, width, height, alt } share image.
 * @param {object} [opts.robots]       Next.js robots object (e.g. noindex).
 * @param {boolean}[opts.canonical]    Set false to omit the canonical tag
 *                                     (noindex utility pages).
 * @param {object} [opts.article]      { publishedTime, modifiedTime, section,
 *                                       tags, authors } for type 'article'.
 * @param {boolean}[opts.absoluteTitle] Use the title verbatim (no template).
 */
export function pageMetadata({
  title,
  description,
  path = '/',
  socialTitle,
  type = 'website',
  image,
  robots,
  canonical = true,
  article,
  absoluteTitle = false,
}) {
  const clean = bareTitle(title);
  const url = absoluteUrl(path);
  const shareTitle = socialTitle || clean;
  const img = image || DEFAULT_SHARE_IMAGE;
  const images = [
    {
      url: absoluteUrl(img.url),
      width: img.width || 1200,
      height: img.height || 630,
      alt: img.alt || shareTitle,
    },
  ];

  const meta = {
    title: absoluteTitle ? { absolute: clean } : clean,
    description,
    openGraph: {
      title: shareTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type,
      images,
      ...(type === 'article' && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            section: article.section,
            tags: article.tags,
            authors: article.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: images.map((i) => i.url),
    },
  };

  if (canonical) meta.alternates = { canonical: url };
  if (robots) meta.robots = robots;
  return meta;
}

// Standard robots value for utility pages that must stay crawlable (so Google
// can read the noindex) but must not be indexed.
export const NOINDEX_FOLLOW = { index: false, follow: true };

const moduleApi = { SITE_URL, SITE_NAME, DEFAULT_SHARE_IMAGE, absoluteUrl, bareTitle, pageMetadata, NOINDEX_FOLLOW };
export default moduleApi;
