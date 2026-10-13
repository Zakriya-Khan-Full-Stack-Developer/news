# Why nameverse.site is stuck at ~400 pages while the old domain keeps 14,000

Diagnosed 2026-10-13 against commit `3f7cff4` and the live site.

---

## TL;DR

**You did not do a migration. You published a second copy of the site.**

Nothing anywhere in this project tells Google the site moved:

- `vercel.json` has **no `redirects` block**.
- `next.config.js` `redirects()` can only rewrite a path **on the same host** — it cannot redirect another domain, and it only contains three internal redirects (`/home`, `/homepage`, `/unique-names`).
- The canonical tags all correctly point at `https://nameverse.site/...`, but **a canonical tag is a hint; a 301 is an instruction.** Without the 301, the old host keeps serving HTTP 200 with its own pages, and Google sees two independent sites publishing identical content.

When Google sees two copies, it keeps the one it already trusts — the old one, with its 14,000 indexed URLs and its history — and classifies the new one as **"Duplicate, Google chose different canonical than user"** or **"Crawled — currently not indexed"**. That is exactly the symptom you are describing: old domain frozen at 14k, new domain frozen at ~400, two months in.

Then, on top of that, this repo was actively making it worse (see below): the sitemap was submitting ~941 URLs that simultaneously served `noindex`, and a whole advertised section of the site (Italian, 352 names) was linking to hard 404s — including from the homepage's #1 trending slot.

---

## Evidence

| Check | Result |
|---|---|
| Canonical tags on new domain | ✅ correct — all self-referencing to `https://nameverse.site` |
| Content uniqueness (250-page sample, 5-gram Jaccard on main content) | ✅ median similarity **0.16**, max 0.34; ~820 words/page, ~55% unique shingles. **Content is not thin and not duplicated.** |
| Content quality | ✅ fine. Ruled out as the cause. |
| Old → new 301 redirects | ❌ **none exist** |
| Sitemap URLs serving `noindex` | ❌ **941 of 12,438** (48 of a 700-URL sample) |
| Child sitemaps advertised but returning 404 | ❌ 1 (`/sitemap/italian.xml`) |
| Sitemap URLs that 308-redirect | ❌ 1 (`/unique-names`) |
| `lastmod` trustworthiness | ❌ every URL stamped with the build timestamp |
| robots.txt sources | ❌ two conflicting files, environment-dependent |
| Internal links to 404s | ❌ homepage + ~40 hubs → **352 dead Italian URLs** |
| Indexability flag agreement (manifest vs page) | ❌ disagreed on **1,919 of 13,801** records |

### The 404 factory

The Italian dataset is 352 records where `meaning`, `longMeaning` and `gender` are **all empty strings**. Zero of them are indexable, so with `dynamicParams = false` **every Italian name URL is a hard 404** — while the homepage, `/names`, `/names/italian`, all 26 letter hubs, `/origins/italian`, `/categories/italian`, `/trending-names` and the US cluster pages all linked straight into them. The homepage's **#1 trending name** linked to `/names/italian/davide` → 404.

A crawler that lands on your homepage and immediately hits a 404 is about the worst first impression a brand-new domain can make.

### The self-contradicting sitemap

`scripts/generate-manifest.mjs` decided `indexable` from the **raw** source record.
`app/names/[religion]/[slug]/page.jsx` decided it from the **enriched** record.

They disagreed on 1,919 records. 941 of those ended up **inside the sitemap while the page served `noindex, follow`** — the site was asking Google to index URLs it was simultaneously telling Google not to index. GSC reports that as *"Submitted URL marked 'noindex'"*, and at that volume it teaches Google the sitemap is not a reliable crawl target. A new domain cannot afford that.

### `generate-manifest.mjs` also documents the earlier, bigger version of this

> "The committed manifest advertised **42,310 names** while only **13,802** JSON files existed on disk. The sitemaps are generated from the manifest, so they published **~28,508 URLs that 404** — each one burning a function invocation and poisoning crawl budget."

That is ~28,500 404s served through your sitemap during the window in which Google was first getting to know this domain. On a domain with no trust yet, that alone is enough to cap indexing for a long time.

---

## What I changed

### 1. `middleware.js` (new) — the actual migration fix
301-redirects every host you own to `https://nameverse.site`, preserving path + query, so the move is **URL-for-URL** (which is what carries ranking signals across).
- Covers `www.nameverse.site` and any `*.vercel.app` automatically. Vercel keeps serving `<project>.vercel.app` forever and it is fully indexable — it must never serve a 200 next to your custom domain.
- Set `LEGACY_HOSTS` (comma-separated, in `.env.example`) to the subdomain you migrated from; it gets redirected too, no code change.
- Hosts you do **not** own pass through untouched, so a forged `Host` header can't bounce visitors at an arbitrary domain.

### 2. `scripts/generate-manifest.mjs` — one source of truth for indexability
Now computes `indexable` through the exact pipeline the page uses: `normalizeNameRecord → enrichNameProfile → isIndexableRecord`.
**Result: 941 self-contradicting URLs → 0.** (verified: 0 of 1,660 sampled sitemap URLs serve `noindex`, up from 48 of 700.)

### 3. Sitemap routes — stop publishing things that aren't there
- `app/sitemap.xml/route.js`: skip traditions with zero indexable records. `Math.ceil(0/5000) || 1` evaluates to `1`, which is why `/sitemap/italian.xml` was advertised and 404'd.
- `app/sitemap/[id]/route.js`: `/unique-names` (a 308) → `/unique-baby-names`; skip empty chunks.
- **Removed `lastmod` everywhere.** All ~12,500 URLs carried `new Date()` — the build timestamp — so on every deploy the entire site claimed to change at the same instant. Google discounts a `lastmod` it can see is synthetic, and with everything "new" on every deploy, nothing is prioritised. On a crawl-budget-limited new domain that stalls indexing by itself. `lastmod` is optional in the Sitemaps Protocol; when it can't be guaranteed accurate it must be omitted.

### 4. No more dead links
- `lib/data/names-data.js`: new exported `isRenderableSlug(rel, slug)` — the single predicate for "does this URL exist?".
- `components/NameCard.jsx`: only links when the target exists. It was the one component that linked unconditionally; `NameChip` and `RankedNameList` already followed this rule.
- `scripts/generate-search-index.mjs`: only indexes names with a real page (the three search clients build hrefs straight from this file).
- `lib/data/us-names.js`: `resolveName()`, `getBiblicalNames()`, `getIslamicNames()` now gate on the same predicate. `resolveName()` carried the comment *"never returns a href that would 404"* — it did.
- `app/trending-names/page.jsx`: trending lists filter to existing pages.

**Result: broken internal links 18 → 0** (567-URL crawl), and all 352 Italian 404s are no longer linked from anywhere.

### 5. `app/names/[religion]/letter/[letter]/page.jsx` — `%23` double-encoding
`generateStaticParams` returned the pre-encoded string `'%23'`; Next.js encodes param values itself, so the file landed on disk as `%2523.html` and `/names/christian/letter/%23` — which is in the sitemap and linked from every Christian letter hub — was a guaranteed 404. Now passes the raw `#`. **→ 200.**

### 6. `public/robots.txt` deleted
It conflicted with `app/robots.js` and they did **not** say the same thing (the `public/` copy had no `Disallow` rules and pointed at `sitemap-index.xml`; the route handler had four `Disallow` rules and pointed at `sitemap.xml`). Which one is served is runtime-dependent: `next start` served the `public/` copy, Vercel served the route handler. Two files, two answers, no way to know which Google saw. One source of truth now.

---

## Before / after

| | Before | After |
|---|---|---|
| Sitemap URLs serving `noindex` | ~941 | **0** |
| Child sitemaps advertised that 404 | 1 | **0** |
| Sitemap URLs that redirect | 1 | **0** |
| `lastmod` | fabricated (build timestamp × 12,563) | **omitted** |
| Broken internal links | 18 found / 352 Italian linked site-wide | **0** |
| robots.txt sources | 2 conflicting | **1** |
| Indexability disagreements | 1,919 records | **0** |
| Old → new 301 | none | **middleware** |
| Sitemap URLs (honest & consistent) | 12,438 (941 broken) | **11,624** (all verified 200 + index + self-canonical) |

Build passes all gates: `prerendered routes: 12617`, `indexable records: 11499`, `indexable records with prerendered HTML: 11499`, `PASS`.

---

## What you still have to do (I can't do these from the repo)

**1. Tell me the old hostname, or set it yourself.**
Set `LEGACY_HOSTS=<your-old-subdomain>` in Vercel → Project Settings → Environment Variables. Until then the middleware can only redirect hosts it can recognise (`www.*`, `*.vercel.app`).

**2. Google Search Console → Change of Address.**
On the **old** property: Settings → Change of Address → pick the new property. This only works if the 301s are live first, and both properties must be verified. This is the single highest-value click in the whole migration.

**3. Fix the duplicate verification tag.**
Every page currently emits **two different** `google-site-verification` values:
- `fB60sPZ-K1f5t10x-57z6f6_n655` (from `metadata.verification` in `app/layout.jsx`)
- `bY09F9IpVk_dzOagZu5xAzZwH9U-Io3IeuBeaBkfG0g` (hardcoded in the `<head>` of `app/layout.jsx`)

One of these belongs to the old property. Delete the stale one once you've confirmed which.

**4. Decide what to do about Italian.**
All 353 records are empty stubs — no meaning, no gender, no body. Nothing links to them now, so they 404 cleanly and will drop out of Google. Either fill the data (352 genuinely indexable pages) or remove the Italian section, because the homepage currently advertises *"352 names → Italian Names"* and links to `/names/italian`, which is a hub with no children.

**5. Fix the homepage's inaccurate claims** (`app/page.jsx`) — these are trust signals and they are wrong:
- *"13,801 Indexable Pages"* → the real figure is 11,499.
- *"Zero Soft-404s"* → until this change the site was serving hundreds of 404s.
- *"instantaneous incremental static regeneration"* → ISR was deliberately removed; output is static at build time.

**6. Resubmit the sitemap** at `https://nameverse.site/sitemap.xml` in the new property, then watch *Pages → Why pages aren't indexed* for two weeks. The count should start moving within days of the 301s + Change of Address going live, not before.
