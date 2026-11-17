#!/usr/bin/env node
/**
 * Post-deploy indexing contract check for NameVerse.
 *
 * Run after a production deploy:
 *   npm run verify:indexing:live
 *   npm run verify:indexing:live -- --all
 *
 * The default checks a deterministic spread of 100 URLs to keep the check
 * inexpensive. --all checks every URL advertised by the sitemap index and
 * every additional sitemap declared in robots.txt.
 */

const BASE_URL = (process.env.SITE_URL || 'https://nameverse.site').replace(/\/$/, '');
const ALL = process.argv.includes('--all');
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = ALL ? Number.POSITIVE_INFINITY : Math.max(1, Number(LIMIT_ARG?.split('=')[1]) || 100);
const CONCURRENCY = 8;

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
    match[1].replace(/&amp;/g, '&').trim()
  );
}

function attribute(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*["\\']([^"\\']*)["\\']', 'i'));
  return match?.[1] || '';
}

async function get(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'NameVerse-Indexing-Contract/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  return { response, body: await response.text() };
}

async function mapLimit(items, limit, fn) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await fn(items[index], index);
    }
  });
  await Promise.all(workers);
}

function selectSpread(urls, limit) {
  if (urls.length <= limit) return urls;
  const selected = [];
  const used = new Set();
  for (let i = 0; i < limit; i += 1) {
    const index = Math.floor((i * (urls.length - 1)) / Math.max(1, limit - 1));
    if (!used.has(index)) {
      used.add(index);
      selected.push(urls[index]);
    }
  }
  return selected;
}

async function main() {
  console.log('NameVerse live indexing contract');
  console.log('Base:', BASE_URL);
  console.log('Mode:', ALL ? 'all sitemap URLs' : `sample of up to ${LIMIT} URLs`);

  const robotsResult = await get(`${BASE_URL}/robots.txt`);
  if (!robotsResult.response.ok) {
    fail(`robots.txt returned HTTP ${robotsResult.response.status}`);
  }
  const robotsBody = robotsResult.body;
  if (!robotsBody.includes(`${BASE_URL}/sitemap.xml`)) {
    fail('robots.txt does not advertise the primary sitemap index');
  }

  const indexResult = await get(`${BASE_URL}/sitemap.xml`);
  if (!indexResult.response.ok) {
    fail(`sitemap.xml returned HTTP ${indexResult.response.status}`);
    return report();
  }
  if (!/<sitemapindex\b/i.test(indexResult.body)) {
    fail('sitemap.xml is not a sitemap index');
    return report();
  }

  const childSitemaps = extractLocs(indexResult.body);
  if (!childSitemaps.length) fail('sitemap index contains no child sitemaps');

  const extraSitemaps = [...robotsBody.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)]
    .map((match) => match[1])
    .filter((url) => url !== `${BASE_URL}/sitemap.xml`);
  const sitemapUrls = [...new Set([...childSitemaps, ...extraSitemaps])];
  const pageUrls = [];

  await mapLimit(sitemapUrls, 4, async (sitemapUrl) => {
    try {
      const { response, body } = await get(sitemapUrl);
      if (!response.ok) {
        fail(`child sitemap HTTP ${response.status}: ${sitemapUrl}`);
        return;
      }
      if (!/<urlset\b/i.test(body)) {
        fail(`child sitemap is not a urlset: ${sitemapUrl}`);
        return;
      }
      const locs = extractLocs(body);
      if (!locs.length) fail(`child sitemap is empty: ${sitemapUrl}`);
      const local = new Set();
      for (const url of locs) {
        if (local.has(url)) fail(`duplicate URL within ${sitemapUrl}: ${url}`);
        local.add(url);
        pageUrls.push(url);
      }
    } catch (error) {
      fail(`could not fetch sitemap ${sitemapUrl}: ${error.message}`);
    }
  });

  notes.push(`child sitemaps checked: ${sitemapUrls.length}`);
  notes.push(`unique URL entries discovered: ${new Set(pageUrls).size}`);
  const targets = selectSpread([...new Set(pageUrls)], LIMIT);
  let checked = 0;

  await mapLimit(targets, CONCURRENCY, async (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== BASE_URL) {
        fail(`non-canonical host in sitemap: ${url}`);
        return;
      }
      const { response, body } = await get(url);
      checked += 1;
      if (response.status !== 200) {
        fail(`sitemap URL returned HTTP ${response.status}: ${url}`);
        return;
      }
      if (response.url.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
        fail(`sitemap URL redirects instead of serving directly: ${url} -> ${response.url}`);
      }

      const canonicalTag = body.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
      const canonicalHref = canonicalTag ? attribute(canonicalTag, 'href') : '';
      if (!canonicalHref) {
        fail(`missing canonical link: ${url}`);
      } else if (new URL(canonicalHref, BASE_URL).href.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
        fail(`canonical does not self-reference: ${url} -> ${canonicalHref}`);
      }

      const robotsTag = body.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0];
      const robotsContent = robotsTag ? attribute(robotsTag, 'content') : '';
      if (/\bnoindex\b/i.test(robotsContent)) {
        fail(`sitemap submits a noindex page: ${url} (${robotsContent})`);
      }
    } catch (error) {
      fail(`page check failed for ${url}: ${error.message}`);
    }
  });

  notes.push(`pages checked: ${checked}`);
  notes.push(`sampling: ${ALL ? 'complete' : `spread sample (${targets.length} of ${new Set(pageUrls).size})`}`);
  report();
}

function report() {
  console.log('');
  for (const note of notes) console.log('  ' + note);
  if (failures.length) {
    console.error(`\nFAIL — ${failures.length} indexing-contract issue(s)`);
    for (const failure of failures.slice(0, 100)) console.error('  - ' + failure);
    if (failures.length > 100) console.error(`  ... and ${failures.length - 100} more`);
    process.exitCode = 1;
  } else {
    console.log('\nPASS — sampled sitemap URLs are directly reachable, indexable, and self-canonical.');
  }
}

main().catch((error) => {
  console.error('Live indexing check crashed:', error);
  process.exitCode = 1;
});
