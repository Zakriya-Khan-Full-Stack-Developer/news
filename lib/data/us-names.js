// ─────────────────────────────────────────────────────────────────────────────
// US (Tier 1) search-demand data + keyword map.
//
// Two rules govern everything in this file:
//
//   1. NO FABRICATED STATISTICS. Every ranking and every state figure below is
//      transcribed from a named, linked source (see lib/data/editorial.js).
//      Where two sources disagree we keep both and let the page explain the
//      difference — that reconciliation is itself a quality signal.
//
//   2. NO DEAD LINKS. Curated name lists are resolved against the real
//      11,412-record manifest at render time. A name we hold a profile for
//      becomes an internal link; a name we do not becomes plain text. We never
//      emit a link to a page that does not exist.
// ─────────────────────────────────────────────────────────────────────────────

import { getManifest, isRenderableSlug } from './names-data.js';

// ── Official national ranking (SSA) — babies born in 2025 ────────────────────
// Source: SSA press release, May 8, 2026
//   https://www.ssa.gov/news/en/press/releases/2026-05-08.html
//   https://www.ssa.gov/oact/babynames/
// Population: Social Security card applications for babies born in calendar
// year 2025. This is NOT a 2026 ranking — 2026 births are published in 2027.
// The cohort year and release date live in RANKING_DATA (editorial.js); every
// page that shows this list must print them next to it.
export const SSA_TOP_10 = {
  dataYear: 2025,
  boys: ['Liam', 'Noah', 'Oliver', 'Theodore', 'Henry', 'James', 'Elijah', 'Mateo', 'William', 'Lucas'],
  girls: ['Olivia', 'Charlotte', 'Emma', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Evelyn', 'Sofia', 'Eliana'],
};

// Ranks 1–20 with the number of babies given each name in 2025, as published
// by SSA (counts for names in the national top 1,000). `prev` is the 2024 rank
// for the top 10, used to show real year-over-year movement.
export const SSA_2025_TOP_20 = {
  boys: [
    { name: 'Liam', count: 20818, prev: 1 },
    { name: 'Noah', count: 20358, prev: 2 },
    { name: 'Oliver', count: 14939, prev: 3 },
    { name: 'Theodore', count: 13355, prev: 4 },
    { name: 'Henry', count: 12020, prev: 6 },
    { name: 'James', count: 11945, prev: 5 },
    { name: 'Elijah', count: 11111, prev: 8 },
    { name: 'Mateo', count: 11045, prev: 7 },
    { name: 'William', count: 10545, prev: 10 },
    { name: 'Lucas', count: 10219, prev: 9 },
    { name: 'Benjamin', count: 9762 },
    { name: 'Levi', count: 9642 },
    { name: 'Elias', count: 8837 },
    { name: 'Luca', count: 8759 },
    { name: 'Jack', count: 8748 },
    { name: 'Sebastian', count: 8605 },
    { name: 'Hudson', count: 8583 },
    { name: 'Samuel', count: 8334 },
    { name: 'Leo', count: 8173 },
    { name: 'Ezra', count: 8126 },
  ],
  girls: [
    { name: 'Olivia', count: 13544, prev: 1 },
    { name: 'Charlotte', count: 13400, prev: 4 },
    { name: 'Emma', count: 12754, prev: 2 },
    { name: 'Amelia', count: 12699, prev: 3 },
    { name: 'Sophia', count: 12561, prev: 6 },
    { name: 'Mia', count: 11078, prev: 5 },
    { name: 'Isabella', count: 10666, prev: 7 },
    { name: 'Evelyn', count: 9123, prev: 8 },
    { name: 'Sofia', count: 8252, prev: 10 },
    { name: 'Eliana', count: 8191, prev: 18 },
    { name: 'Ava', count: 7732, prev: 9 },
    { name: 'Eleanor', count: 7649 },
    { name: 'Violet', count: 7546 },
    { name: 'Ailany', count: 7136 },
    { name: 'Aurora', count: 7065 },
    { name: 'Harper', count: 6792 },
    { name: 'Elizabeth', count: 6760 },
    { name: 'Lily', count: 6673 },
    { name: 'Camila', count: 6591 },
    { name: 'Nora', count: 6380 },
  ],
};

// SSA's own list of the five names that "increased the most in popularity in
// 2025" (same press release). This is the only trend list on the site that is
// measured — a change in rank between two dated SSA cohorts (2024 → 2025).
export const SSA_RISERS_2025 = {
  boys: ['Kasai', 'Akari', 'Eziah', 'Jasai', 'Neithan'],
  girls: ['Klarity', 'Rynlee', 'Ailanny', 'Naylani', 'Madisson'],
  // Detail SSA published for the top riser.
  note: 'Kasai climbed 1,108 places to enter the SSA top 1,000 for the first time, at No. 639.',
};

// Share of all US births covered by the top 1,000 names (SSA "Beyond the Top
// 1000 Names", https://www.ssa.gov/oact/babynames/limits.html).
export const SSA_TOP_1000_SHARE_2025 = { boys: 75.59, girls: 67.25, total: 71.51 };

// ── Independent 2026 ranking table (BabyCenter), ranks 1–40 ──────────────────
// Source: https://www.babycenter.com/baby-names/most-popular/top-baby-names-2026
// Snapshot: August 2026. Population: names parents volunteered to BabyCenter
// during 2026 — an in-progress, self-reported table, not birth records.
// Kept separate from the SSA list on purpose: the two orderings differ, and the
// page explains why rather than silently picking one.
export const BABYCENTER_2026 = {
  snapshot: 'August 2026',
  boys: [
    'Noah', 'Liam', 'Oliver', 'Elijah', 'Mateo', 'Lucas', 'Elias', 'Levi', 'Ezra', 'Leo',
    'Asher', 'Luca', 'Henry', 'Hudson', 'Theodore', 'James', 'Sebastian', 'Samuel', 'Waylon', 'Daniel',
    'Josiah', 'Theo', 'Cooper', 'Wyatt', 'Gabriel', 'Maverick', 'Jack', 'Julian', 'Benjamin', 'Grayson',
    'Santiago', 'Michael', 'Rowan', 'Mason', 'Luke', 'Muhammad', 'Isaiah', 'Alexander', 'Roman', 'Ethan',
  ],
  girls: [
    'Olivia', 'Eliana', 'Amelia', 'Charlotte', 'Sophia', 'Isabella', 'Emma', 'Aurora', 'Evelyn', 'Mia',
    'Ellie', 'Lily', 'Violet', 'Sofia', 'Hazel', 'Ava', 'Aria', 'Luna', 'Ella', 'Willow',
    'Nova', 'Harper', 'Eleanor', 'Gianna', 'Scarlett', 'Layla', 'Lucy', 'Isla', 'Elena', 'Iris',
    'Penelope', 'Ivy', 'Lainey', 'Elizabeth', 'Nora', 'Delilah', 'Chloe', 'Valentina', 'Camila', 'Paisley',
  ],
};

// ── State-level top names ────────────────────────────────────────────────────
// Source: SSA "Top 5 Names in Each of the 50 States", births in 2025
//   https://www.ssa.gov/oact/babynames/state/top5_2025.html
// 50 states + DC. `boy`/`girl` = births in 2025; `prevBoy`/`prevGirl` = births
// in 2024, which lets each state row show a real year-over-year movement.
export const STATE_DATA_YEARS = { current: 2025, previous: 2024 };

export const STATE_TOP_NAMES = [
  { state: 'Alabama', abbr: 'AL', boy: 'John', girl: 'Charlotte', prevBoy: 'William', prevGirl: 'Charlotte' },
  { state: 'Alaska', abbr: 'AK', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Amelia' },
  { state: 'Arizona', abbr: 'AZ', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Arkansas', abbr: 'AR', boy: 'Liam', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'California', abbr: 'CA', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Mia' },
  { state: 'Colorado', abbr: 'CO', boy: 'Liam', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Connecticut', abbr: 'CT', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Mia' },
  { state: 'Delaware', abbr: 'DE', boy: 'Noah', girl: 'Mia', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'District of Columbia', abbr: 'DC', boy: 'Noah', girl: 'Emma', prevBoy: 'James', prevGirl: 'Charlotte' },
  { state: 'Florida', abbr: 'FL', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Georgia', abbr: 'GA', boy: 'Liam', girl: 'Amelia', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'Hawaii', abbr: 'HI', boy: 'Elijah', girl: 'Isla', prevBoy: 'Noah', prevGirl: 'Olivia' },
  { state: 'Idaho', abbr: 'ID', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Illinois', abbr: 'IL', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Indiana', abbr: 'IN', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Iowa', abbr: 'IA', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Kansas', abbr: 'KS', boy: 'Theodore', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Kentucky', abbr: 'KY', boy: 'Oliver', girl: 'Amelia', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'Louisiana', abbr: 'LA', boy: 'Noah', girl: 'Amelia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Maine', abbr: 'ME', boy: 'Theodore', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Maryland', abbr: 'MD', boy: 'Liam', girl: 'Ailany', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Massachusetts', abbr: 'MA', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Noah', prevGirl: 'Olivia' },
  { state: 'Michigan', abbr: 'MI', boy: 'Theodore', girl: 'Charlotte', prevBoy: 'Noah', prevGirl: 'Charlotte' },
  { state: 'Minnesota', abbr: 'MN', boy: 'Theodore', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'Mississippi', abbr: 'MS', boy: 'James', girl: 'Amelia', prevBoy: 'William', prevGirl: 'Ava' },
  { state: 'Missouri', abbr: 'MO', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Amelia' },
  { state: 'Montana', abbr: 'MT', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Lainey' },
  { state: 'Nebraska', abbr: 'NE', boy: 'Liam', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Nevada', abbr: 'NV', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'New Hampshire', abbr: 'NH', boy: 'Theodore', girl: 'Charlotte', prevBoy: 'Theodore', prevGirl: 'Charlotte' },
  { state: 'New Jersey', abbr: 'NJ', boy: 'Liam', girl: 'Emma', prevBoy: 'Liam', prevGirl: 'Mia' },
  { state: 'New Mexico', abbr: 'NM', boy: 'Noah', girl: 'Mia', prevBoy: 'Noah', prevGirl: 'Mia' },
  { state: 'New York', abbr: 'NY', boy: 'Noah', girl: 'Emma', prevBoy: 'Liam', prevGirl: 'Mia' },
  { state: 'North Carolina', abbr: 'NC', boy: 'Noah', girl: 'Amelia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'North Dakota', abbr: 'ND', boy: 'Liam', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Evelyn' },
  { state: 'Ohio', abbr: 'OH', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Oklahoma', abbr: 'OK', boy: 'Liam', girl: 'Olivia', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Oregon', abbr: 'OR', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Olivia' },
  { state: 'Pennsylvania', abbr: 'PA', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Noah', prevGirl: 'Olivia' },
  { state: 'Rhode Island', abbr: 'RI', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'South Carolina', abbr: 'SC', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Noah', prevGirl: 'Charlotte' },
  { state: 'South Dakota', abbr: 'SD', boy: 'Oliver', girl: 'Lainey', prevBoy: 'Liam', prevGirl: 'Amelia' },
  { state: 'Tennessee', abbr: 'TN', boy: 'Noah', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Amelia' },
  { state: 'Texas', abbr: 'TX', boy: 'Liam', girl: 'Emma', prevBoy: 'Liam', prevGirl: 'Olivia' },
  { state: 'Utah', abbr: 'UT', boy: 'Oliver', girl: 'Emma', prevBoy: 'Oliver', prevGirl: 'Olivia' },
  { state: 'Vermont', abbr: 'VT', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Amelia' },
  { state: 'Virginia', abbr: 'VA', boy: 'Liam', girl: 'Charlotte', prevBoy: 'Liam', prevGirl: 'Charlotte' },
  { state: 'Washington', abbr: 'WA', boy: 'Noah', girl: 'Olivia', prevBoy: 'Oliver', prevGirl: 'Olivia' },
  { state: 'West Virginia', abbr: 'WV', boy: 'Waylon', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Amelia' },
  { state: 'Wisconsin', abbr: 'WI', boy: 'Oliver', girl: 'Charlotte', prevBoy: 'Oliver', prevGirl: 'Charlotte' },
  { state: 'Wyoming', abbr: 'WY', boy: 'Theodore', girl: 'Aurora', prevBoy: 'Oliver', prevGirl: 'Emma' },
];

// ── Curated thematic lists ───────────────────────────────────────────────────
// These are editorial selections, not statistics. Each is resolved against the
// manifest at render time, so the linked subset is always real.

export const VINTAGE_NAMES = [
  'Eleanor', 'Clara', 'Alice', 'Nora', 'Evelyn', 'Hazel', 'Violet', 'Ruby', 'Rose', 'Grace',
  'Charlotte', 'Amelia', 'Margaret', 'Frances', 'Ruth', 'Esther', 'Sylvia', 'Josephine', 'Genevieve',
  'Lillian', 'Beatrice', 'Dorothy', 'Mabel', 'Florence', 'Edith', 'Agnes', 'Harriet', 'Winifred',
  'Clementine', 'Matilda', 'Penelope', 'Delilah', 'Ophelia', 'Cordelia', 'Theodora', 'Cecilia',
  'Theodore', 'Henry', 'Walter', 'Arthur', 'Oliver', 'Leo', 'Jack', 'George', 'Frank', 'Louis',
  'Samuel', 'Benjamin', 'Vincent', 'Augustus', 'Edmund', 'Alfred', 'Ernest', 'Stanley', 'Harold',
  'Milton', 'Clifford', 'Reginald', 'Percival', 'Archibald', 'Bartholomew', 'Cornelius', 'Ezekiel',
  'Gideon', 'Josiah', 'Silas', 'Amos', 'Elias', 'Levi', 'Ezra', 'Asher', 'Abel', 'Enoch', 'Isaiah',
  'Jeremiah', 'Nathaniel', 'Reuben', 'Simeon', 'Thaddeus', 'Tobias', 'Zachariah', 'Felix', 'August',
  'Eloise', 'Iris', 'Maeve', 'Willa', 'Juniper', 'Marlowe', 'Sylvie', 'Rosalind', 'Imogen', 'Adeline',
];

export const NATURE_NAMES = [
  'Willow', 'Hazel', 'Ivy', 'Rose', 'Lily', 'Violet', 'Daisy', 'Poppy', 'Jasmine', 'Laurel',
  'Heather', 'Holly', 'Iris', 'Fern', 'Sage', 'Wren', 'Robin', 'Lark', 'Raven', 'Aspen',
  'Cedar', 'Rowan', 'Ash', 'Birch', 'Forrest', 'River', 'Brooks', 'Stone', 'Flint', 'Clay',
  'Sky', 'Rain', 'Storm', 'Winter', 'Summer', 'Autumn', 'Aurora', 'Luna', 'Nova', 'Stella',
  'Celeste', 'Marisol', 'Marina', 'Coral', 'Pearl', 'Opal', 'Ruby', 'Jade', 'Amber', 'Crystal',
  'Meadow', 'Prairie', 'Sierra', 'Savannah', 'Dakota', 'Cheyenne', 'Juniper', 'Magnolia', 'Camellia',
  'Azalea', 'Zinnia', 'Marigold', 'Clover', 'Sorrel', 'Tansy', 'Yarrow', 'Alder', 'Hawthorn',
  'Linden', 'Oakley', 'Sylvan', 'Heath', 'Dale', 'Glenn', 'Wade', 'Ford', 'Cliff', 'Ridge',
  'Slate', 'Onyx', 'Jasper', 'Ember', 'Blaze', 'Phoenix', 'Orion', 'Atlas', 'Leo', 'Sirius',
  'Vega', 'Lyra', 'Andromeda', 'Callisto', 'Selene', 'Helios', 'Zephyr', 'Aquila', 'Corvus', 'Cygnus',
];

export const SHORT_NAMES = [
  'Kai', 'Leo', 'Max', 'Eli', 'Ivy', 'Ava', 'Mia', 'Zoe', 'Rue', 'Lux',
  'Wren', 'Nico', 'Zia', 'Jax', 'Rex', 'Fox', 'Kit', 'Ash', 'Bo', 'Cy',
  'Dee', 'Ed', 'Gil', 'Hal', 'Ike', 'Jo', 'Kim', 'Lou', 'Mac', 'Ned',
  'Oli', 'Pat', 'Ray', 'Sam', 'Ted', 'Tom', 'Val', 'Wes', 'Zac', 'Ada',
  'Bea', 'Cleo', 'Dot', 'Eve', 'Fay', 'Gia', 'Hana', 'Ida', 'Joy', 'Kay',
  'Lia', 'May', 'Nia', 'Ora', 'Pia', 'Ria', 'Sue', 'Tia', 'Una', 'Via',
  'Wyn', 'Xena', 'Yara', 'Zara', 'Noa', 'Remi', 'Romy', 'Sena', 'Tova', 'Vera',
  'Willa', 'Anya', 'Bria', 'Cora', 'Dara', 'Elsa', 'Freya', 'Greta', 'Hilda', 'Ines',
  'Juno', 'Kira', 'Lena', 'Mira', 'Nina', 'Orla', 'Quinn', 'Rhea', 'Sela', 'Thea',
  'Uma', 'Vita', 'Zora', 'Ari', 'Ben', 'Cal', 'Dan', 'Gus', 'Hugo', 'Ira',
];

export const GENDER_NEUTRAL_NAMES = [
  'Quinn', 'Parker', 'Remi', 'Rowan', 'Avery', 'Riley', 'Jordan', 'Casey', 'Taylor', 'Morgan',
  'Jamie', 'Alex', 'Sam', 'Charlie', 'Emerson', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Marlowe',
  'Micah', 'Noah', 'Oakley', 'Phoenix', 'Reagan', 'River', 'Rory', 'Sage', 'Sawyer', 'Shiloh',
  'Skyler', 'Sloane', 'Tatum', 'Blake', 'Cameron', 'Dakota', 'Drew', 'Ellis', 'Frankie', 'Greer',
  'Harper', 'Indigo', 'Jules', 'Kai', 'Lennon', 'Marley', 'Monroe', 'Nico', 'Onyx', 'Peyton',
  'Reese', 'Robin', 'Ryan', 'Spencer', 'Sydney', 'Toby', 'Wren', 'Zion', 'Arden', 'Blair',
  'Campbell', 'Devin', 'Easton', 'Fallon', 'Harbor', 'Justice', 'Kit', 'Lane', 'Merritt', 'Nova',
  'Ocean', 'Palmer', 'Quincy', 'Raine', 'Storm', 'True', 'Wynn', 'Zephyr', 'Ari', 'Bay',
  'Cedar', 'Dune', 'Eden', 'Fable', 'Gray', 'Haven', 'Ira', 'Juno', 'Koa', 'Lior',
];

// ── Manifest index + resolver ────────────────────────────────────────────────
// Built once per server instance. Maps a lowercased name to its real profile.
let _index = null;

export function getNameIndex() {
  if (_index) return _index;
  const manifest = getManifest();
  const map = new Map();
  for (const rel of Object.keys(manifest)) {
    for (const item of manifest[rel] || []) {
      if (!item.name || !item.slug || !item.indexable) continue;
      const key = String(item.name).toLowerCase();
      const current = map.get(key);
      // Prefer an indexable canonical record, then the highest popularity score
      // when the same spelling appears in more than one tradition.
      if (!current || (Number(item.popularity_score) || 0) > (Number(current.popularity_score) || 0)) {
        map.set(key, {
          name: item.name,
          slug: item.slug,
          religion: rel,
          meaning: item.meaning || '',
          origin: item.origin || '',
          gender: item.gender || '',
          popularity_score: item.popularity_score || 0,
        });
      }
    }
  }
  _index = map;
  return map;
}

// Resolve one name to a linkable record, or to a plain-text record when we hold
// no profile. Never returns a href that would 404.
//
// FIX — "never returns a href that would 404" stopped being true. This function
// only checked that the name exists in the manifest, but the detail route sets
// `dynamicParams = false`, so a manifest entry is not enough: the page also has
// to be prerendered (indexable, or a canonicalised duplicate). Records that are
// neither — the 973 Islamic negative-assertion stubs, and all 352 Italian
// records — exist in the manifest and 404 on the site. Curated US lists such as
// SSA_TOP_10, VINTAGE_NAMES and SHORT_NAMES resolve through here, so /popular-
// names-2026, /top-baby-names-2026, /vintage-baby-names and /short-baby-names
// were publishing links to those 404s. Gate on the same predicate the route
// uses so the two can never drift apart again.
export function resolveName(name) {
  const idx = getNameIndex();
  const hit = idx.get(String(name || '').toLowerCase());
  if (!hit) return { name, href: null, hasProfile: false };
  if (!isRenderableSlug(hit.religion, hit.slug)) {
    return { name: hit.name, href: null, hasProfile: false };
  }
  return {
    name: hit.name,
    href: `/names/${hit.religion}/${hit.slug}`,
    hasProfile: true,
    religion: hit.religion,
    meaning: hit.meaning,
    origin: hit.origin,
    gender: hit.gender,
  };
}

export function resolveNames(names) {
  return (names || []).map(resolveName);
}

// Tradition-aware resolver for editorial content. "Adam", "Sara" or "Maryam"
// exist in more than one tradition; an article about Islamic names should link
// the Islamic profile, not whichever record happens to carry a higher score.
// Falls back to the generic resolver, and never returns a href that would 404.
let _byTradition = null;
function getTraditionIndex() {
  if (_byTradition) return _byTradition;
  const manifest = getManifest();
  const out = {};
  for (const rel of Object.keys(manifest)) {
    const map = new Map();
    for (const item of manifest[rel] || []) {
      if (!item.name || !item.slug || !item.indexable) continue;
      const key = String(item.name).toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
    out[rel] = map;
  }
  _byTradition = out;
  return out;
}

export function resolveNameIn(name, religion) {
  if (religion) {
    const hit = getTraditionIndex()[religion]?.get(String(name || '').toLowerCase());
    if (hit && isRenderableSlug(religion, hit.slug)) {
      return {
        name: hit.name,
        href: `/names/${religion}/${hit.slug}`,
        hasProfile: true,
        religion,
        meaning: hit.meaning || '',
        origin: hit.origin || '',
        gender: hit.gender || '',
      };
    }
  }
  return resolveName(name);
}

// Evenly spaced sample of an alphabetised list: item k*(N/n) for k = 0..n-1.
// Gives every part of the alphabet representation in proportion to its size,
// with no implied ranking. Deterministic, so the prerendered page is stable.
export function sampleEvenly(items, n) {
  const sorted = [...items].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  const out = [];
  for (let k = 0; k < n; k += 1) out.push(sorted[Math.floor(k * step)]);
  return out;
}

// Pick a spread of items across first letters (round-robin A→Z), then return
// them alphabetically. Used where a list has no meaningful ranking: it avoids
// both a fake "most popular" order and a list that is nothing but A-names.
export function spreadByInitial(items, limit) {
  const buckets = new Map();
  for (const it of [...items].sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
    const k = String(it.name || '').charAt(0).toUpperCase();
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(it);
  }
  const keys = [...buckets.keys()].sort();
  const out = [];
  let round = 0;
  while (out.length < limit) {
    let added = false;
    for (const k of keys) {
      const b = buckets.get(k);
      if (b[round]) {
        out.push(b[round]);
        added = true;
        if (out.length >= limit) break;
      }
    }
    if (!added) break;
    round += 1;
  }
  return out.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// How many of a curated list we can actually link. Used by the build verifier
// and shown on the page as an honest coverage figure.
export function coverage(names) {
  const resolved = resolveNames(names);
  const linked = resolved.filter((r) => r.hasProfile).length;
  return { total: resolved.length, linked, resolved };
}

// ── Dataset-backed selections ────────────────────────────────────────────────
// These pull straight from the verified manifest, so every result is linkable.

// Every Christian record carries origin "Biblical", including saint and
// virtue names that do not occur in scripture, so the record's CATEGORY is the
// better test. Returned as an even A–Z sample — the score is not a ranking.
export function getBiblicalNames(limit = 120) {
  const manifest = getManifest();
  const out = [];
  for (const rel of Object.keys(manifest)) {
    for (const item of manifest[rel] || []) {
      if (!item.slug || !item.meaning || !item.indexable || item.canonicalSlug) continue;
      const category = String(item.category || '');
      const isBiblical = category ? /^biblical$/i.test(category) : /biblical/i.test(String(item.origin || ''));
      if (isBiblical) out.push({ ...item, religion: rel });
    }
  }
  return sampleEvenly(out, limit);
}

// Islamic records carry no popularity score at all (every value is 0), so any
// "most popular" ordering would be fiction. Return an alphabetical spread
// across the alphabet instead, and say so on the page.
export function getIslamicNames(limit = 120) {
  const manifest = getManifest();
  const items = (manifest.islamic || []).filter(
    (i) => i.slug && i.meaning && i.indexable && !i.canonicalSlug
  );
  return spreadByInitial(items, limit).map((i) => ({ ...i, religion: 'islamic' }));
}

// ── Keyword map ──────────────────────────────────────────────────────────────
// The strategy artifact: every US page, its target slug, its intent, and the
// keyword set it is built to rank for.
export const US_CLUSTERS = [
  {
    slug: 'top-baby-names-2026',
    // The single national-ranking page. /popular-names-2026 targeted the same
    // intent and now 301-redirects here (next.config.js).
    h1: 'Top Baby Names 2026: The Latest US Rankings',
    primary: 'top baby names 2026',
    intent: 'Informational',
    longTails: [
      'top baby names 2026',
      'most popular baby names 2026',
      'most popular baby names in the us 2025 ssa',
      'top boy names 2026',
      'top girl names 2026',
      'most popular boy names in america',
      'most popular girl names in america',
    ],
    lsi: ['SSA 2025 births', 'national ranking', 'BabyCenter 2026', 'year-over-year', 'ranking table'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'unique-baby-names',
    h1: 'Unique Baby Names — Rare Picks With Real Meaning',
    primary: 'unique baby names',
    intent: 'Commercial',
    longTails: [
      'unique baby names 2026',
      'rare baby names',
      'uncommon baby names',
      'unique boy names',
      'unique girl names',
      'baby names nobody else has',
    ],
    lsi: ['rarity', 'distinctive', 'uncommon', 'shortlist', 'meaning'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'gender-neutral-names',
    h1: 'Gender-Neutral Baby Names',
    primary: 'gender neutral baby names',
    intent: 'Commercial',
    longTails: [
      'gender neutral baby names',
      'unisex baby names',
      'gender neutral names for boys and girls',
      'nonbinary baby names',
      'androgynous names',
    ],
    lsi: ['unisex', 'androgynous', 'gender-inclusive', 'cross-gender usage'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'baby-names-by-state',
    h1: 'Most Popular Baby Names by State',
    primary: 'baby names by state',
    intent: 'Informational',
    longTails: [
      'most popular baby names by state',
      'popular baby names in my state',
      'top baby names by state 2026',
      'most popular boy names by state',
      'most popular girl names by state',
    ],
    lsi: ['state-level data', 'regional variation', 'SSA state dataset', 'year-over-year'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'vintage-baby-names',
    h1: 'Vintage Baby Names: Old-Fashioned Names Worth Reviving',
    primary: 'vintage baby names',
    intent: 'Commercial',
    longTails: [
      'vintage baby names',
      'old fashioned baby names',
      'old fashioned names that are popular again',
      'classic baby names 2026',
      'heirloom baby names',
      'antique baby names',
    ],
    lsi: ['revival', 'heritage', 'nostalgia', 'classic', 'generational'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'biblical-baby-names',
    h1: 'Biblical Baby Names for Boys and Girls',
    primary: 'biblical baby names',
    intent: 'Commercial',
    longTails: [
      'biblical baby names',
      'biblical names for boys',
      'biblical names for girls',
      'bible names and meanings',
      'hebrew bible baby names',
    ],
    lsi: ['scripture', 'Hebrew', 'Old Testament', 'New Testament', 'meaning'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'muslim-baby-names-america',
    // A cultural and practical guide. National statistics do not record
    // religion, so this page never ranks names by Muslim-American usage.
    h1: 'Muslim Baby Names in America: A Meaning-First Guide',
    primary: 'muslim baby names in america',
    intent: 'Commercial',
    longTails: [
      'muslim baby names in america',
      'islamic baby names usa',
      'muslim boy names for american families',
      'muslim girl names for american families',
      'arabic baby names easy to pronounce in english',
    ],
    lsi: ['Arabic', 'Quranic', 'transliteration', 'spelling', 'meaning'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'nature-baby-names',
    h1: 'Nature Baby Names',
    primary: 'nature baby names',
    intent: 'Commercial',
    longTails: [
      'nature baby names',
      'nature inspired baby names 2026',
      'flower baby names',
      'tree baby names',
      'celestial baby names',
      'earth baby names',
    ],
    lsi: ['botanical', 'celestial', 'landscape', 'seasonal', 'natural world'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
  {
    slug: 'short-baby-names',
    h1: 'Short Baby Names — One and Two Syllables',
    primary: 'short baby names',
    intent: 'Commercial',
    longTails: [
      'short baby names',
      'one syllable baby names',
      'short boy names',
      'short girl names',
      '3 letter baby names',
      'minimalist baby names',
    ],
    lsi: ['syllable count', 'minimalist', 'easy to spell', 'modern'],
    schema: ['CollectionPage', 'ItemList', 'FAQPage', 'BreadcrumbList', 'Article'],
  },
];

export function getCluster(slug) {
  return US_CLUSTERS.find((c) => c.slug === slug) || null;
}

const moduleApi = {
  SSA_TOP_10,
  SSA_2025_TOP_20,
  SSA_RISERS_2025,
  SSA_TOP_1000_SHARE_2025,
  BABYCENTER_2026,
  STATE_DATA_YEARS,
  STATE_TOP_NAMES,
  VINTAGE_NAMES,
  NATURE_NAMES,
  SHORT_NAMES,
  GENDER_NEUTRAL_NAMES,
  US_CLUSTERS,
  getCluster,
  getNameIndex,
  resolveName,
  resolveNames,
  resolveNameIn,
  spreadByInitial,
  sampleEvenly,
  coverage,
  getBiblicalNames,
  getIslamicNames,
};

export default moduleApi;
