// Shared helpers for normalizing name data from the manifest + JSON profiles.

export const RELIGIONS = ['islamic', 'christian', 'hindu', 'italian'];

export const RELIGION_LABELS = {
  islamic: 'Islamic',
  christian: 'Christian',
  hindu: 'Hindu',
  italian: 'Italian',
};

export const SITE_URL = 'https://nameverse.site';

export function getCanonicalUrl(path = '') {
  const cleanPath = String(path || '')
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '') // strip origin if present
    .replace(/\/+$/, '') // strip trailing slash
    .replace(/\.html$/, ''); // strip .html
  return cleanPath === '' || cleanPath === '/' ? SITE_URL : `${SITE_URL}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}

export function religionLabel(religion) {
  if (!religion) return '';
  const r = String(religion).toLowerCase().trim();
  if (RELIGION_LABELS[r]) return RELIGION_LABELS[r];
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fixed gender normalization to properly recognize all female variants
export function normalizeGender(gender) {
  const g = String(gender || '').toLowerCase().trim();
  if (!g) return null;
  const isFemale = /female|girl|feminine/.test(g);
  const isMale = /(^|[^e])male|\bboy|masculin/.test(g);
  if (isMale && isFemale) return 'unisex';
  if (isFemale) return 'girl';
  if (isMale) return 'boy';
  // "unknown" / "unspecified" mean the record does not say — that is NOT the
  // same claim as "used for both boys and girls". Only explicit unisex /
  // neutral values map to unisex; everything else is unrecorded (null).
  if (/unknown|unspecified|n\/a|not\s/.test(g)) return null;
  if (/unisex|neutral|genderless/.test(g)) return 'unisex';
  return null;
}

export function isBoy(gender) {
  const g = String(gender || '').toLowerCase();
  const isFemale = /female|girl|feminine/.test(g);
  const isMale = /(^|[^e])male|\bboy|masculin/.test(g);
  return isMale && !isFemale;
}

export function isGirl(gender) {
  const g = String(gender || '').toLowerCase();
  const isFemale = /female|girl|feminine/.test(g);
  const isMale = /(^|[^e])male|\bboy|masculin/.test(g);
  return isFemale && !isMale;
}

export function genderLabel(gender) {
  const g = normalizeGender(gender);
  if (g === 'boy') return 'Boy';
  if (g === 'girl') return 'Girl';
  if (g === 'unisex') return 'Unisex';
  return '';
}

export function genderWord(gender) {
  const g = normalizeGender(gender);
  if (g === 'boy') return 'boy';
  if (g === 'girl') return 'girl';
  return 'baby';
}

export const ORIGIN_SLUGS = [
  'arabic',
  'biblical',
  'sanskrit',
  'hindu',
  'italian',
  'persian',
  'english',
  'tamil',
  'hindi',
  'bengali',
  'urdu',
];

export const ORIGIN_LABELS = {
  arabic: 'Arabic',
  biblical: 'Biblical',
  sanskrit: 'Sanskrit',
  hindu: 'Hindu',
  italian: 'Italian',
  persian: 'Persian',
  english: 'English',
  tamil: 'Tamil',
  hindi: 'Hindi',
  bengali: 'Bengali',
  urdu: 'Urdu',
};

// Match an origin string to a curated origin slug.
//
// TAXONOMY RULES
//   • A record is filed under an origin hub only when its origin string names
//     that origin. There are no silent re-mappings: Sikh is not Hindu, and
//     Punjabi or Marathi are not Hindi. "Mythology" says nothing about which
//     tradition (Greek? Hindu? Norse?), so it maps to no hub. Records with
//     such origins keep their own label on the profile and simply do not
//     appear on an unrelated hub.
//   • Negative statements ("no specific Hindu origin", "not directly from
//     Hindu sources") must not be read as positive matches.
export function originSlugFor(origin) {
  const o = String(origin || '').toLowerCase();
  if (!o) return null;
  if (/\bno\b|\bnot\b|\bnon-/.test(o)) return null;
  for (const slug of ORIGIN_SLUGS) {
    if (o.includes(slug)) return slug;
  }
  return null;
}

export const CATEGORY_SLUGS = ['islamic', 'hindu', 'biblical', 'saint', 'virtue', 'italian'];

export const CATEGORY_LABELS = {
  islamic: 'Islamic',
  hindu: 'Hindu',
  biblical: 'Biblical',
  saint: 'Saint',
  virtue: 'Virtue',
  italian: 'Italian',
};

export function categorySlugFor(category) {
  const c = String(category || '').toLowerCase();
  if (!c) return null;
  for (const slug of CATEGORY_SLUGS) {
    if (c.includes(slug)) return slug;
  }
  return null;
}

export function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function truncate(text, max) {
  const s = String(text || '');
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const idx = cut.lastIndexOf(' ');
  return (idx > max * 0.6 ? cut.slice(0, idx) : cut) + '…';
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
