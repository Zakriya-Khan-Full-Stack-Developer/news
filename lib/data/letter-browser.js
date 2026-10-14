export const ALL_RELIGIONS = ['islamic', 'christian', 'hindu', 'italian'];
export const ALL_LETTERS = [...'abcdefghijklmnopqrstuvwxyz', '#'];

export function lettersFor(religionKey, manifest) {
  const available = new Set();
  const items = (manifest && manifest[religionKey]) || [];
  for (const item of items) {
    if (!item.name || !item.indexable) continue;
    const firstChar = item.name.trim().charAt(0).toLowerCase();
    available.add(/^[a-z]$/.test(firstChar) ? firstChar : '#');
  }
  return available;
}

/**
 * Letter hubs are paginated rather than truncated.
 *
 * The hub used to render `names.slice(0, 300)` — a deliberate cap, because a
 * single page holding all 975 "a" names was heavy enough to crash mobile
 * browsers. But truncation meant every name past the first 300 of its letter
 * had no internal link anywhere on the site: 2,705 of 11,412 name pages (23%)
 * were orphans, which is the single biggest reason a crawler never reaches
 * them. Paginating keeps each page at the same safe size while giving every
 * record a crawlable path from a hub.
 */
export const LETTER_PAGE_SIZE = 300;

/** Every record in a religion whose name starts with `letter`, popularity-first. */
export function namesForLetter(religionKey, letter, manifest) {
  return ((manifest && manifest[religionKey]) || [])
    .filter((item) => {
      if (!item.name || !item.indexable) return false;
      const firstChar = item.name.trim().charAt(0).toLowerCase();
      return letter === '#' ? !/^[a-z]$/.test(firstChar) : firstChar === letter;
    })
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
}

/** Normalise a raw route param into the letter key ('a'..'z' or '#'). */
export function parseLetterParam(raw) {
  const decoded = decodeURIComponent(raw || '');
  return decoded === '%23' || decoded === '#' ? '#' : decoded.toLowerCase();
}

/** '#' must be percent-encoded in a URL path; every other letter is literal. */
export function letterUrlSegment(letter) {
  return letter === '#' ? '%23' : letter;
}

export function letterPageCount(religionKey, letter, manifest) {
  return Math.max(1, Math.ceil(namesForLetter(religionKey, letter, manifest).length / LETTER_PAGE_SIZE));
}
