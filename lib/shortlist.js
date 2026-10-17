// ─────────────────────────────────────────────────────────────────────────────
// Saved-names shortlist — privacy-first, on-device persistence.
//
// The shortlist lives ONLY in the visitor's browser (localStorage). Nothing is
// sent to a server, there is no account, and clearing site data removes it.
// Sharing works by encoding the list in a URL the visitor chooses to copy, so
// the recipient's browser — not ours — holds the data.
//
// Item shape (compact, matches the search index):
//   { n: name, s: slug, r: religion, m: meaning, o: origin, g: gender }
// ─────────────────────────────────────────────────────────────────────────────

export const SHORTLIST_KEY = 'nv-shortlist-v1';
export const SHORTLIST_EVENT = 'nv-shortlist-change';
export const SHORTLIST_MAX = 50;

const VALID_RELIGIONS = new Set(['islamic', 'christian', 'hindu', 'italian']);

function clean(item) {
  if (!item || typeof item !== 'object') return null;
  const s = String(item.s || '').toLowerCase().trim();
  const r = String(item.r || '').toLowerCase().trim();
  if (!s || !/^[a-z0-9-]+$/.test(s) || !VALID_RELIGIONS.has(r)) return null;
  return {
    n: String(item.n || s).slice(0, 60),
    s,
    r,
    m: String(item.m || '').slice(0, 140),
    o: String(item.o || '').slice(0, 60),
    g: String(item.g || '').slice(0, 10),
  };
}

export function itemKey(item) {
  return `${item.r}:${item.s}`;
}

export function readShortlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHORTLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const out = [];
    for (const it of parsed) {
      const c = clean(it);
      if (c && !seen.has(itemKey(c))) {
        seen.add(itemKey(c));
        out.push(c);
      }
    }
    return out.slice(0, SHORTLIST_MAX);
  } catch {
    return [];
  }
}

export function writeShortlist(list) {
  if (typeof window === 'undefined') return [];
  const seen = new Set();
  const out = [];
  for (const it of list || []) {
    const c = clean(it);
    if (c && !seen.has(itemKey(c))) {
      seen.add(itemKey(c));
      out.push(c);
    }
  }
  const capped = out.slice(0, SHORTLIST_MAX);
  try {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(capped));
  } catch {
    // Storage full or disabled (private mode): the in-memory list still works
    // for this page view.
  }
  window.dispatchEvent(new CustomEvent(SHORTLIST_EVENT, { detail: capped }));
  return capped;
}

export function isSaved(list, item) {
  const c = clean(item);
  return Boolean(c && list.some((x) => itemKey(x) === itemKey(c)));
}

export function addToShortlist(item) {
  const list = readShortlist();
  const c = clean(item);
  if (!c || isSaved(list, c)) return list;
  return writeShortlist([...list, c]);
}

export function removeFromShortlist(item) {
  const c = clean(item);
  if (!c) return readShortlist();
  return writeShortlist(readShortlist().filter((x) => itemKey(x) !== itemKey(c)));
}

export function toggleShortlist(item) {
  return isSaved(readShortlist(), item) ? removeFromShortlist(item) : addToShortlist(item);
}

// Share links carry only `religion:slug` pairs; names and meanings are looked
// up again by the recipient's browser from the public search index.
export function encodeShare(list) {
  return (list || [])
    .map((x) => `${x.r}:${x.s}`)
    .slice(0, SHORTLIST_MAX)
    .join(',');
}

export function decodeShare(param) {
  return String(param || '')
    .split(',')
    .map((pair) => {
      const [r, s] = pair.split(':');
      return clean({ r, s, n: s });
    })
    .filter(Boolean)
    .slice(0, SHORTLIST_MAX);
}

export function subscribeShortlist(callback) {
  if (typeof window === 'undefined') return () => {};
  const onChange = () => callback(readShortlist());
  const onStorage = (e) => {
    if (e.key === SHORTLIST_KEY) onChange();
  };
  window.addEventListener(SHORTLIST_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SHORTLIST_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
