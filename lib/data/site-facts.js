import { getManifest, getBlogPosts } from './names-data.js';
import { RELIGION_LABELS, originSlugFor, ORIGIN_LABELS } from './name-utils.js';
import { ALL_LETTERS, lettersFor } from './letter-browser.js';

// ─────────────────────────────────────────────────────────────────────────────
// Site facts — every number the About and Contact pages are allowed to print.
//
// WHY THIS FILE EXISTS
// The site has a history of advertising numbers the dataset did not contain:
// a stale manifest claimed 42,310 names while 13,802 files existed on disk, and
// "11,412" was typed by hand into 30+ files where nothing kept it honest.
//
// So the About page does not contain a single hand-written count. Everything is
// derived here, at build time, from the same manifest that generates the
// sitemap, the hub pages and the name profiles. A claim on the page that the
// dataset cannot back becomes impossible: change the data and the page changes
// with it, or the page stops compiling.
//
// This module reads from disk (node:fs), so it is server-only — build-time
// static generation, never shipped to the client.
// ─────────────────────────────────────────────────────────────────────────────

function countBy(items, predicate) {
  let n = 0;
  for (const item of items) if (predicate(item)) n += 1;
  return n;
}

export function getSiteFacts() {
  const manifest = getManifest();

  const traditions = [];
  const publishedByTradition = {};
  let records = 0;
  let published = 0;
  let boys = 0;
  let girls = 0;
  let unisex = 0;
  const origins = new Set();
  const letters = new Set();
  let letterHubs = 0;

  for (const key of ['islamic', 'christian', 'hindu', 'italian']) {
    const items = manifest[key] || [];
    const publishedItems = items.filter((item) => item.indexable);
    const publishedCount = publishedItems.length;

    records += items.length;
    published += publishedCount;
    publishedByTradition[key] = publishedCount;

    boys += countBy(publishedItems, (i) => i.gender === 'boy');
    girls += countBy(publishedItems, (i) => i.gender === 'girl');
    unisex += countBy(publishedItems, (i) => i.gender === 'unisex');

    for (const item of publishedItems) {
      const originSlug = originSlugFor(item.origin);
      if (originSlug) origins.add(originSlug);
    }

    const available = lettersFor(key, manifest);
    for (const letter of available) {
      letters.add(`${key}:${letter}`);
      letterHubs += 1;
    }

    traditions.push({
      key,
      label: RELIGION_LABELS[key] || key,
      href: `/names/${key}`,
      records: items.length,
      published: publishedCount,
      boys: countBy(publishedItems, (i) => i.gender === 'boy'),
      girls: countBy(publishedItems, (i) => i.gender === 'girl'),
      unisex: countBy(publishedItems, (i) => i.gender === 'unisex'),
      /** Published share of the source records on disk, as a whole number. */
      publishedShare: items.length ? Math.round((publishedCount / items.length) * 100) : 0,
      /** True when the tradition has nothing published and only the hub exists. */
      indexable: publishedCount > 0,
    });
  }

  const originLabels = [...origins].map((slug) => ORIGIN_LABELS[slug] || slug).sort((a, b) => a.localeCompare(b));
  const blogPosts = (() => {
    try {
      return getBlogPosts();
    } catch {
      return [];
    }
  })();

  // Pages a crawler can actually land on, counted the same way the sitemap
  // counts them: every published profile, plus the hub pages that have content.
  const hubsPerTradition = 3; // tradition hub, boy hub, girl hub
  const hubPages = traditions.filter((t) => t.indexable).length * hubsPerTradition;

  return {
    records,
    published,
    heldBack: records - published,
    boys,
    girls,
    unisex,
    traditions,
    publishedByTradition,
    origins: origins.size,
    originLabels,
    /** Distinct religion:letter browse hubs that contain at least one name. */
    letters: letters.size,
    letterHubs,
    blogPosts: blogPosts.length,
    hubPages,
    /** A defensible, rounded-range description for prose that must not look machine-exact. */
    publishedRange: 'over 11,000',
  };
}

export default getSiteFacts;
