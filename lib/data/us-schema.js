import { SITE_URL, PUBLISHER, AUTHOR, REVIEWER, LAST_UPDATED, resolveSources, DEFAULT_SOURCE_KEYS } from './editorial.js';

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD builders for the US pages.
//
// Every page emits a consistent graph:
//   CollectionPage  — what this page IS (a curated collection)
//   ItemList        — the ranked or curated names, as real entities. Only a
//                     genuinely ranked list (a dated SSA ranking) is marked
//                     ItemListOrderDescending; curated editorial selections
//                     are ItemListUnordered so the markup never implies a
//                     ranking the page does not have.
//   FAQPage         — the visible FAQ block
//   BreadcrumbList  — the visible breadcrumb trail
//   Article         — authorship, freshness, publisher, citations (E-E-A-T)
//
// The Article node is what carries the E-E-A-T payload: a named author, a
// publisher, dateModified, and a `citation` array pointing at the real sources.
// ─────────────────────────────────────────────────────────────────────────────

export function buildBreadcrumb(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };
}

export function buildCollectionPage({ url, name, description, lastUpdated = LAST_UPDATED }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name,
    description,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    dateModified: lastUpdated,
  };
}

// `items` is an array of { name, url?, description? }. Entries without a url are
// still listed — they are real names, we simply hold no profile for them yet.
// `ordered` must be true ONLY for a real ranking (position = rank).
export function buildItemList({ url, name, items, ordered = false, idSuffix = 'itemlist' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#${idSuffix}`,
    name,
    numberOfItems: items.length,
    itemListOrder: ordered
      ? 'https://schema.org/ItemListOrderDescending'
      : 'https://schema.org/ItemListUnordered',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url ? `${SITE_URL}${item.url}` : undefined,
      description: item.description || undefined,
    })),
  };
}

export function buildFaq(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// The E-E-A-T node. `citation` is populated from the same source list the page
// renders visibly, so the machine-readable and human-readable sourcing agree.
// `datePublished` is emitted only when a real first-publication date is known.
// Re-using the last-modified date as the publication date misstates history.
export function buildArticle({
  url,
  headline,
  description,
  sourceKeys = DEFAULT_SOURCE_KEYS,
  lastUpdated = LAST_UPDATED,
  datePublished,
}) {
  const sources = resolveSources(sourceKeys);

  const author = AUTHOR.isOrganisation
    ? { '@type': 'Organization', name: AUTHOR.name, url: AUTHOR.bioUrl }
    : { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, url: AUTHOR.bioUrl };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en-US',
    ...(datePublished ? { datePublished } : {}),
    dateModified: lastUpdated,
    author,
    ...(REVIEWER.name
      ? {
          reviewedBy: {
            '@type': 'Person',
            name: REVIEWER.name,
            ...(REVIEWER.credentials ? { description: REVIEWER.credentials } : {}),
          },
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER.name,
      url: PUBLISHER.url,
      logo: { '@type': 'ImageObject', url: PUBLISHER.logo },
    },
    citation: sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.name,
      url: s.url,
      publisher: { '@type': 'Organization', name: s.publisher },
    })),
  };
}

// Convenience: assemble the full graph for a standard US page.
export function buildUsPageSchema({
  url,
  cluster,
  description,
  breadcrumb,
  items = [],
  faqs = [],
  sourceKeys,
  lastUpdated,
  ordered = false,
}) {
  return [
    buildCollectionPage({ url, name: cluster.h1, description, lastUpdated }),
    items.length ? buildItemList({ url, name: cluster.h1, items, ordered }) : null,
    buildFaq(faqs),
    buildBreadcrumb(breadcrumb),
    buildArticle({ url, headline: cluster.h1, description, sourceKeys, lastUpdated }),
  ].filter(Boolean);
}

const moduleApi = {
  buildBreadcrumb,
  buildCollectionPage,
  buildItemList,
  buildFaq,
  buildArticle,
  buildUsPageSchema,
};

export default moduleApi;
