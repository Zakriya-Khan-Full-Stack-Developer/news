// ─────────────────────────────────────────────────────────────────────────────
// Blog quality gate — runs in `prebuild` (fast: reads one JSON file).
//
// It replaces scripts/generate-blog-posts.mjs, which could mass-produce
// near-duplicate posts with fabricated dates and invented author credentials
// and write them straight into public/data/blog-posts.json. Articles are now
// written and edited by hand, and this gate refuses to build if one of them
// breaks the editorial rules the site publicly commits to:
//
//   • every article declares at least one source, and every source key exists
//     in lib/data/editorial.js;
//   • ids are unique, URL-safe slugs; titles are unique;
//   • publish/updated dates are real ISO dates, not in the future, and
//     lastUpdated is not earlier than publishDate;
//   • the stored read time matches the words actually published;
//   • the excerpt fits a search snippet (≤ 160 characters);
//   • no unsupported trend or popularity phrasing slips back in.
//
// Run: node scripts/verify-blog.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { SOURCES } from '../lib/data/editorial.js';
import { readTimeLabel, wordCount, isPublishable } from '../lib/data/blog.js';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'public', 'data', 'blog-posts.json');
const OG_DIR = path.join(ROOT, 'public', 'blog', 'og');

const MIN_WORDS = 500;
const MAX_EXCERPT = 160;

// Phrases that assert a trend or ranking the site cannot source. A dated,
// sourced statement ("No. 4 for babies born in 2025 (SSA)") is fine; these
// free-floating claims are not.
const BANNED = [
  /\btrending (?:in|for) 20\d\d\b/i,
  /\bdominating (?:the )?trend charts\b/i,
  /\bmost popular (?:baby )?names (?:of|for|in) 2026\b/i,
  /\bright now\b/i,
  /\bcontinue[sd]? to rise in popularity\b/i,
];

const today = new Date().toISOString().slice(0, 10);
const failures = [];
const warnings = [];

let posts;
try {
  posts = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch (err) {
  console.error(`verify-blog: cannot read ${FILE}: ${err.message}`);
  process.exit(1);
}
if (!Array.isArray(posts)) {
  console.error('verify-blog: blog-posts.json must be an array');
  process.exit(1);
}

const ids = new Set();
const titles = new Set();
const isoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !Number.isNaN(Date.parse(s));

for (const post of posts) {
  const id = post?.id || '(missing id)';
  const fail = (msg) => failures.push(`${id}: ${msg}`);

  if (!post?.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.id)) fail('id must be a lowercase, hyphenated slug');
  if (ids.has(post.id)) fail('duplicate id');
  ids.add(post.id);

  if (!post.title) fail('missing title');
  if (titles.has(post.title)) fail('duplicate title');
  titles.add(post.title);

  if (!isPublishable(post)) fail('missing content.introduction or content.sections');
  if (!post.excerpt) fail('missing excerpt');
  else if (post.excerpt.length > MAX_EXCERPT) fail(`excerpt is ${post.excerpt.length} chars (max ${MAX_EXCERPT})`);
  if (!post.category) fail('missing category');
  if (post.tags !== undefined && !Array.isArray(post.tags)) fail('tags must be an array');
  if (post.seoKeywords !== undefined && !Array.isArray(post.seoKeywords)) fail('seoKeywords must be an array');

  if (!isoDate(post.publishDate)) fail(`publishDate "${post.publishDate}" is not an ISO date`);
  if (post.lastUpdated && !isoDate(post.lastUpdated)) fail(`lastUpdated "${post.lastUpdated}" is not an ISO date`);
  if (isoDate(post.publishDate) && post.publishDate > today) fail(`publishDate ${post.publishDate} is in the future`);
  if (isoDate(post.lastUpdated) && post.lastUpdated > today) fail(`lastUpdated ${post.lastUpdated} is in the future`);
  if (isoDate(post.publishDate) && isoDate(post.lastUpdated) && post.lastUpdated < post.publishDate) {
    fail('lastUpdated is earlier than publishDate');
  }

  const keys = post.sourceKeys || [];
  if (!keys.length) fail('declares no sourceKeys');
  for (const k of keys) if (!SOURCES[k]) fail(`unknown source key "${k}"`);

  const words = wordCount(post);
  if (words < MIN_WORDS) warnings.push(`${id}: only ${words} words`);
  const expected = readTimeLabel(post);
  if (post.readTime && post.readTime !== expected) fail(`readTime "${post.readTime}" but content is ${expected}`);

  const text = JSON.stringify([post.title, post.subtitle, post.excerpt, post.content]);
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) fail(`unsupported claim: "${m[0]}"`);
  }

  if (!fs.existsSync(path.join(OG_DIR, `${post.id}.png`))) {
    warnings.push(`${id}: no share card (run scripts/generate-share-images.py); the site default will be used`);
  }
}

console.log(`verify-blog: ${posts.length} posts checked`);
for (const w of warnings) console.log(`  WARN  ${w}`);
if (failures.length) {
  for (const f of failures) console.log(`  FAIL  ${f}`);
  console.log(`verify-blog: ${failures.length} problem(s) — fix public/data/blog-posts.json`);
  process.exit(1);
}
console.log('verify-blog: PASS');
