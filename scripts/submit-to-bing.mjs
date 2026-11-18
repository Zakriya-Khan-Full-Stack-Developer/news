// ─────────────────────────────────────────────────────────────────────────────
// NameVerse — Bing IndexNow + Bing Webmaster Tools submission
//
// WHY THIS EXISTS
// Google Search Console is half the indexing battle. Bing (which also powers
// Yahoo and DuckDuckGo search) has its own submission pipeline and does NOT
// automatically discover new URLs the way Google does. Without active
// submission, Bing may take weeks or months to find new pages.
//
// WHAT THIS SCRIPT DOES
// 1. Reads the generated sitemap child files and extracts every published URL.
// 2. Submits them to Bing via the IndexNow API (instant submission, no API key
//    needed beyond a shared key file hosted at the site root).
// 3. Logs the results so you can verify which URLs were accepted.
//
// INDEXNOW SETUP
// IndexNow is a protocol supported by Bing, Yandex, and Seznam. Google does
// not use it but Bing treats it as an instant ping — the URL is typically
// crawled within 24 hours.
//
// Steps to activate:
// 1. Generate a key: any 16+ character hex string, e.g. `openssl rand -hex 16`
// 2. Set it as the environment variable INDEXNOW_KEY
// 3. Host it at https://nameverse.site/{key}.txt — the file content must be
//    the key itself. Add it to public/ in the Next.js project.
// 4. Run this script after every deploy: `node scripts/submit-to-bing.mjs`
//
// BING WEBMASTER TOOLS (manual one-time)
// 1. Go to https://www.bing.com/webmasters/
// 2. Add site: https://nameverse.site
// 3. Verify using the msvalidate.01 meta tag (already in layout.jsx — replace
//    PLACEHOLDER_REPLACE_WITH_BING_CODE with the real value from Bing)
// 4. Submit the sitemap: https://nameverse.site/sitemap.xml
// 5. Use the URL Submission API for bulk submission if needed
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://nameverse.site';

// Read the IndexNow key from the .indexnow-key file if not set via env.
// The key file is committed to public/ so it is served at the site root.
let _indexNowKey = process.env.INDEXNOW_KEY || '';
if (!_indexNowKey) {
  try {
    _indexNowKey = fs.readFileSync(path.join(process.cwd(), '.indexnow-key'), 'utf8').trim();
  } catch {
    // Key not available — script will print setup instructions.
  }
}
const INDEXNOW_KEY = _indexNowKey;
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY || 'placeholder'}.txt`;

// Read all URLs from the build manifest and blog posts
function getAllUrls() {
  const manifestPath = path.join(process.cwd(), 'src', 'lib', 'data', 'names-manifest.json');
  const blogPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');

  const urls = new Set();

  // Core pages
  const corePages = [
    '/',
    '/names',
    '/origins',
    '/categories',
    '/about',
    '/contact',
    '/trending-names',
    '/popularity',
    '/name-meanings',
    '/names-by-meaning',
    '/names-by-origin',
    '/top-baby-names-2026',
    '/unique-baby-names',
    '/gender-neutral-names',
    '/baby-names-by-state',
    '/vintage-baby-names',
    '/biblical-baby-names',
    '/muslim-baby-names-america',
    '/nature-baby-names',
    '/short-baby-names',
    '/editorial-policy',
    '/privacy',
    '/terms',
    '/blog',
  ];
  for (const p of corePages) urls.add(`${SITE_URL}${p}`);

  // Gender hubs
  const genderHubs = [
    '/islamic-boy-names',
    '/islamic-girl-names',
    '/christian-boy-names',
    '/christian-girl-names',
    '/hindu-boy-names',
    '/hindu-girl-names',
  ];
  for (const gh of genderHubs) urls.add(`${SITE_URL}${gh}`);

  // Name detail pages from manifest
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const rel of ['islamic', 'christian', 'hindu', 'italian']) {
      for (const item of manifest[rel] || []) {
        if (item.slug && item.indexable) {
          urls.add(`${SITE_URL}/names/${rel}/${item.slug}`);
        }
      }
    }
  } catch (err) {
    console.error('Could not read manifest:', err.message);
  }

  // Tradition hubs
  for (const rel of ['islamic', 'christian', 'hindu']) {
    urls.add(`${SITE_URL}/names/${rel}`);
  }

  // Blog posts
  try {
    const posts = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
    for (const post of posts) {
      if (post.id && post.content?.introduction && post.content?.sections?.length) {
        urls.add(`${SITE_URL}/blog/${post.id}`);
      }
    }
  } catch (err) {
    console.error('Could not read blog posts:', err.message);
  }

  return [...urls];
}

async function submitToIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    console.log('\n⚠ INDEXNOW_KEY environment variable is not set.');
    console.log('  To enable IndexNow submission:');
    console.log('  1. Generate a key: openssl rand -hex 16');
    console.log('  2. Set INDEXNOW_KEY=<your-key>');
    console.log('  3. Create public/<key>.txt with the key as content');
    console.log('  4. Re-run this script\n');
    return false;
  }

  // IndexNow accepts up to 10,000 URLs per request
  const batchSize = 10000;
  let allOk = true;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const body = {
      host: 'nameverse.site',
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: batch,
    };

    try {
      const response = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });

      if (response.status === 200) {
        console.log(`✓ IndexNow accepted batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs)`);
      } else if (response.status === 202) {
        console.log(`✓ IndexNow queued batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs) — will be processed`);
      } else if (response.status === 422) {
        console.error(`✗ IndexNow rejected batch — key validation failed. Ensure ${INDEXNOW_KEY_LOCATION} returns the key.`);
        allOk = false;
      } else {
        console.error(`✗ IndexNow returned ${response.status} for batch ${Math.floor(i / batchSize) + 1}`);
        allOk = false;
      }
    } catch (err) {
      console.error(`✗ IndexNow request failed:`, err.message);
      allOk = false;
    }
  }

  return allOk;
}

// Also submit via Bing Webmaster Tools URL Submission API (requires API key)
async function submitToBingWMT(urls) {
  const bingApiKey = process.env.BING_WMT_API_KEY;

  if (!bingApiKey) {
    console.log('\nℹ BING_WMT_API_KEY not set — skipping Bing Webmaster Tools URL Submission API.');
    console.log('  To enable:');
    console.log('  1. Go to Bing Webmaster Tools → Settings → API Access');
    console.log('  2. Generate an API key');
    console.log('  3. Set BING_WMT_API_KEY=<your-key>\n');
    return false;
  }

  // Bing WMT URL Submission API: max 10,000 per day per site
  const dailyLimit = 10000;
  const toSubmit = urls.slice(0, dailyLimit);
  const apiUrl = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${bingApiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ siteUrl: SITE_URL, urlList: toSubmit }),
    });
    const data = await response.json();

    if (data.d) {
      console.log(`✓ Bing WMT accepted ${toSubmit.length} URLs`);
      return true;
    } else {
      console.error('✗ Bing WMT submission failed:', JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error('✗ Bing WMT request failed:', err.message);
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NameVerse — Bing & IndexNow URL Submission');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const urls = getAllUrls();
  console.log(`Total URLs to submit: ${urls.length}\n`);

  if (urls.length === 0) {
    console.error('No URLs found. Run this script from the project root after building.');
    process.exit(1);
  }

  // Print a summary breakdown
  const nameUrls = urls.filter((u) => u.includes('/names/') && !u.endsWith('/names')).length;
  const blogUrls = urls.filter((u) => u.includes('/blog/')).length;
  const otherUrls = urls.length - nameUrls - blogUrls;
  console.log(`  Name pages:    ${nameUrls}`);
  console.log(`  Blog posts:    ${blogUrls}`);
  console.log(`  Other pages:   ${otherUrls}\n`);

  // Submit via IndexNow
  console.log('── IndexNow Submission ──');
  await submitToIndexNow(urls);

  // Submit via Bing Webmaster Tools API
  console.log('\n── Bing Webmaster Tools URL Submission ──');
  await submitToBingWMT(urls);

  console.log('\n✓ Done. Monitor indexing status at:');
  console.log('  Google: https://search.google.com/search-console');
  console.log('  Bing:   https://www.bing.com/webmasters/');
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
