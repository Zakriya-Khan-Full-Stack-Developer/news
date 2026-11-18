// ─────────────────────────────────────────────────────────────────────────────
// NameVerse — Google Indexing API URL submission
//
// WHY THIS EXISTS
// The Google Indexing API allows programmatic submission of URLs for crawling.
// While it does not guarantee indexing, it notifies Google of new/updated
// content much faster than waiting for organic discovery. This is especially
// important for a migrated domain where Google's crawl schedule is uncertain.
//
// SETUP
// 1. Go to Google Cloud Console → create a project
// 2. Enable the "Indexing API" for the project
// 3. Create a Service Account and download the JSON key file
// 4. Add the service account email as an Owner of nameverse.site in
//    Google Search Console (Settings → Users and permissions → Add user)
// 5. Save the key file and set GOOGLE_INDEXING_KEY_PATH env var to its path
// 6. Run: node scripts/submit-to-google.mjs
//
// LIMITS
// Google allows up to 200 URL notifications per day. This script prioritises:
//   - New blog posts (highest priority)
//   - Updated core pages
//   - High-traffic name pages (by popularity_score)
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SITE_URL = 'https://nameverse.site';
const KEY_PATH = process.env.GOOGLE_INDEXING_KEY_PATH || '';

function getAllUrls() {
  const manifestPath = path.join(process.cwd(), 'src', 'lib', 'data', 'names-manifest.json');
  const blogPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');
  const urls = [];

  // Core pages (high priority for recrawl)
  const corePages = [
    '/',
    '/names',
    '/origins',
    '/categories',
    '/about',
    '/blog',
    '/top-baby-names-2026',
    '/unique-baby-names',
    '/gender-neutral-names',
    '/biblical-baby-names',
    '/muslim-baby-names-america',
    '/editorial-policy',
    '/trending-names',
  ];
  for (const p of corePages) urls.push({ url: `${SITE_URL}${p}`, priority: 1 });

  // Blog posts (high priority — new content)
  try {
    const posts = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
    for (const post of posts) {
      if (post.id && post.content?.introduction && post.content?.sections?.length) {
        urls.push({ url: `${SITE_URL}/blog/${post.id}`, priority: 1 });
      }
    }
  } catch (err) {
    console.error('Could not read blog posts:', err.message);
  }

  // Top name pages by popularity (fill remaining quota)
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const allNames = [];
    for (const rel of ['islamic', 'christian', 'hindu']) {
      for (const item of manifest[rel] || []) {
        if (item.slug && item.indexable) {
          allNames.push({
            url: `${SITE_URL}/names/${rel}/${item.slug}`,
            priority: 2,
            score: Number(item.popularity_score) || 0,
          });
        }
      }
    }
    // Sort by popularity and take what fits in the remaining quota
    allNames.sort((a, b) => b.score - a.score);
    urls.push(...allNames);
  } catch (err) {
    console.error('Could not read manifest:', err.message);
  }

  return urls;
}

// JWT creation for Google Service Account authentication
function createJwt(privateKey, serviceAccountEmail) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${encodedHeader}.${encodedPayload}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  const signature = sign.sign(privateKey, 'base64url');

  return `${data}.${signature}`;
}

async function getAccessToken(serviceAccount) {
  const jwt = createJwt(serviceAccount.private_key, serviceAccount.client_email);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function notifyUrlUpdate(url, accessToken) {
  const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url,
      type: 'URL_UPDATED',
    }),
  });

  const data = await response.json();
  return { url, status: response.status, data };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NameVerse — Google Indexing API Submission');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!KEY_PATH) {
    console.log('⚠ GOOGLE_INDEXING_KEY_PATH environment variable is not set.');
    console.log('\n  To enable Google Indexing API submission:');
    console.log('  1. Create a Google Cloud project and enable the Indexing API');
    console.log('  2. Create a Service Account and download the JSON key');
    console.log('  3. Add the service account email as Owner in Google Search Console');
    console.log('     (Search Console → Settings → Users and permissions → Add user)');
    console.log('  4. Set GOOGLE_INDEXING_KEY_PATH=<path-to-key.json>');
    console.log('  5. Re-run this script\n');
    return;
  }

  // Load service account key
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  } catch (err) {
    console.error('Could not read service account key:', err.message);
    process.exit(1);
  }

  // Get access token
  console.log('Authenticating with Google...');
  let accessToken;
  try {
    accessToken = await getAccessToken(serviceAccount);
    console.log('✓ Authenticated\n');
  } catch (err) {
    console.error('Authentication failed:', err.message);
    process.exit(1);
  }

  const allUrls = getAllUrls();
  const DAILY_LIMIT = 200;

  // Prioritise: core pages and blog posts first, then top name pages
  const prioritised = allUrls
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (b.score || 0) - (a.score || 0);
    })
    .slice(0, DAILY_LIMIT)
    .map((u) => u.url);

  console.log(`Submitting ${prioritised.length} URLs to Google (daily limit: ${DAILY_LIMIT})\n`);

  let ok = 0;
  let fail = 0;

  for (const url of prioritised) {
    try {
      const result = await notifyUrlUpdate(url, accessToken);
      if (result.status === 200) {
        ok++;
        if (ok % 20 === 0) console.log(`  ✓ ${ok}/${prioritised.length} submitted...`);
      } else {
        fail++;
        if (fail <= 5) console.error(`  ✗ ${url}: ${result.status} ${JSON.stringify(result.data).slice(0, 100)}`);
      }
    } catch (err) {
      fail++;
      if (fail <= 5) console.error(`  ✗ ${url}: ${err.message}`);
    }
  }

  console.log(`\n✓ Done: ${ok} URLs notified, ${fail} failed`);
  console.log('  Monitor at: https://search.google.com/search-console');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
