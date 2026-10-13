# Why nameverse.site is stuck at ~400 pages while nameverse.vercel.app keeps 14,000

Diagnosed 2026-10-13 against commit `3f7cff4` and the live site.
Updated after the old host was confirmed as `nameverse.vercel.app`.

---

## Correction first

My original headline was **"you never did a migration — nothing redirects the old host"**.

**That was wrong.** Vercel automatically redirects a project's production URL to its assigned custom domain, and I verified it on three paths including a 404:

```
https://nameverse.vercel.app/names/islamic/aaban  ->  https://nameverse.site/names/islamic/aaban
https://nameverse.vercel.app/robots.txt           ->  https://nameverse.site/robots.txt
https://nameverse.vercel.app/this-page-does-not-exist-xyz123  ->  https://nameverse.site/... (404)
```

The redirect is in place and working URL-for-URL. The `middleware.js` I added is still correct and useful (it pins `www.*` and any future host, and it makes the behaviour explicit rather than dependent on a platform default), but it was **not** the missing piece.

---

## So what is actually wrong

### ⭐ The real cause: the letter-browse URLs changed shape, so every redirect lands on a 404

Google still has pages indexed on `nameverse.vercel.app` under the **old** URL shape:

```
indexed:  https://nameverse.vercel.app/names/islamic/c
redirect: https://nameverse.site/names/islamic/c   ->   404
```

The site now serves that page at `/names/islamic/**letter/**c`. So the redirect destination matches the *name-detail* route `/names/[religion]/[slug]`, looks for a name called "c", finds none, and 404s.

**Verified live:** `https://nameverse.site/names/islamic/c` → 404. Verified safe to fix: the dataset contains **zero** single-character name slugs, so a letter redirect cannot shadow a real name page.

That is the whole mechanism. A redirect that ends at a 404 transfers nothing: the old URL is dropped, no new URL is indexed, and `nameverse.site` never accumulates pages. The ~400 pages that *are* indexed are the ones Google found fresh — homepage, hubs, and a slice of the sitemap — not anything that arrived via the migration.

**Fixed** in `next.config.js`:

```js
{ source: '/names/:religion/:letter([a-z]|%23)',
  destination: '/names/:religion/letter/:letter',
  permanent: true }
```

66 of 108 legacy letter URLs now resolve to 200. The other 42 (e.g. `/names/islamic/z`) still 404 because the current dataset genuinely has no names for those letters — 404 is the correct answer there, and redirecting them somewhere unrelated would just create soft-404s.

### Second factor: ~28,500 names are gone from the dataset

The site used to advertise **42,310 names**. It now has **13,801**. The names on the old indexed page prove the content itself was replaced, not just the URLs:

```
caamira     GONE
caferun     GONE
caftaanun   GONE
chabuk      GONE
chadia      present
```

Any old URL pointing at a removed name can never transfer, no matter how good the redirects are.

**Timeline caveat:** you said the removal was recent and that the new domain was already not indexing three months ago, before the cut. If that is right, then the data loss and the URL-shape change are *recent* amplifiers, not the original cause — see [What I still can't confirm](#what-i-still-cant-confirm-from-the-repo).

### Third factor: the site may have been failing to serve pages at all

The site used to advertise **42,310 names**. It now has **13,801**. `scripts/generate-manifest.mjs` says so in its own comments:

> "The committed manifest advertised 42,310 names while only 13,802 JSON files existed on disk. The sitemaps are generated from the manifest, so they published ~28,508 URLs that 404."

The stale numbers are still baked into the UI, which is how the scale of the collapse is visible from outside:

| Where | Claimed | Actual |
|---|---|---|
| `app/not-found.jsx` search box | "Search 13,801 baby names" | 13,801 |
| `app/not-found.jsx` tradition tiles | Islamic 18k / Christian 12k / Hindu 10k | 5,180 / 4,136 / 4,133 |
| `app/page.jsx` FAQ | "indexes over 42,000 baby names" | 13,801 |
| `app/page.jsx` "Indexable Pages" | 13,801 | 11,499 |

Google had ~14,000 pages indexed on `nameverse.vercel.app` from that larger era. Those URLs now 301 to `nameverse.site`, and **a large fraction of them land on pages that no longer exist**. A redirect to a 404 transfers nothing — Google just drops the URL. So the 14k can never fully arrive at the new domain.

### Why the survivors are arriving so slowly

Even the ~11,500 pages that *do* still exist have to be re-crawled one at a time:

1. Google fetches the old URL on `nameverse.vercel.app`
2. sees the 301
3. fetches the new URL on `nameverse.site`
4. indexes it

That is ~23,000 fetches, and **crawl rate is per-host** — `nameverse.site` starts at zero regardless of how much trust the old host had. Authority only transfers as each individual redirect is confirmed. At a new host's initial crawl rate, 14,000 URLs takes a long time. Two months is not yet abnormal *on its own*.

### …but the sitemap, which is the shortcut, was broken

The sitemap is how Google skips that whole re-crawl loop and goes straight to the live URLs. This one was actively untrustworthy:

- **941 URLs were in the sitemap while the page served `noindex, follow`.** `generate-manifest.mjs` judged the **raw** record; `app/names/[religion]/[slug]/page.jsx` judged the **enriched** record. They disagreed on 1,919 of 13,801 records. GSC reports this as *"Submitted URL marked 'noindex'"* — the site was asking Google to index URLs it was simultaneously telling Google not to index.
- **`/sitemap/italian.xml` was advertised in the sitemap index and returned 404** (`Math.ceil(0/5000) || 1` evaluates to `1`).
- **`/unique-names` was in the sitemap and 308-redirects** to `/unique-baby-names`.
- **Every `lastmod` was the build timestamp** — all ~12,500 URLs claiming to change at the same second on every deploy. Google discounts a `lastmod` it can see is synthetic, and with everything "new" every deploy, nothing is prioritised.
- **Two conflicting `robots.txt` files** (`public/robots.txt` and `app/robots.js`) saying different things; which one is served is runtime-dependent.

So the shortcut was closed, and Google was left with the slow path.

### Plus a 404 factory

The Italian dataset is 352 records with empty `meaning`, `longMeaning` and `gender`. Zero are indexable, so with `dynamicParams = false` **every Italian name URL is a hard 404** — while the homepage (its **#1 trending slot**), `/names`, `/names/italian`, all 26 letter hubs, `/origins/italian`, `/categories/italian`, `/trending-names` and the US cluster pages linked straight into them.

A crawler that lands on your homepage and immediately hits a 404 is about the worst first impression a brand-new host can make — and during a migration, when Google is deciding how much to trust `nameverse.site`, first impressions are the whole game.

### Ruled out: content quality

250-page sample, 5-gram Jaccard on main content: **median similarity 0.16, max 0.34**, ~820 words per page, ~55% unique shingles. The content is genuinely unique and substantial. It is not the problem.

---

## What I changed

### 1. Honest numbers everywhere (the 42,000-era leftovers)
- `app/not-found.jsx`: tradition counts and the search placeholder now read from the manifest. This page is the most-crawled page on the site right now, because thousands of deleted URLs resolve to it — and it was telling Google the site had 42,000 names.
- `app/page.jsx`: dropped the "42,000 names" FAQ answer; "Indexable Pages" now shows the real 11,499 instead of 13,801; replaced the false *"Zero Soft-404s … instantaneous incremental static regeneration"* claim (ISR was deliberately removed) with something true.

### 2. Sitemap no longer contradicts the pages it points at
- `generate-manifest.mjs`: `indexable` is now decided by the exact pipeline the page uses — `normalizeNameRecord → enrichNameProfile → isIndexableRecord`. **941 self-contradicting URLs → 0.**
- `app/sitemap.xml/route.js`: skip traditions with zero indexable records (the `/sitemap/italian.xml` 404).
- `app/sitemap/[id]/route.js`: `/unique-names` → `/unique-baby-names`; skip empty chunks.
- Both routes: **removed `lastmod`.** It was fabricated, so Google was ignoring it; omitting it is what the Sitemaps Protocol recommends when accuracy can't be guaranteed.

### 3. No more links to pages that do not exist
- `lib/data/names-data.js`: new exported `isRenderableSlug(rel, slug)` — the single predicate for "does this URL exist?".
- `components/NameCard.jsx`: link only when the target exists. It was the one component that linked unconditionally; `NameChip` and `RankedNameList` already followed this rule.
- `scripts/generate-search-index.mjs`, `lib/data/us-names.js` (`resolveName`, `getBiblicalNames`, `getIslamicNames`), `app/trending-names/page.jsx`: gate on the same predicate. `resolveName()` carried the comment *"never returns a href that would 404"* — it did.

**Broken internal links: 18 → 0** (597-URL crawl). All 352 Italian 404s are no longer linked from anywhere.

### 4. `app/names/[religion]/letter/[letter]/page.jsx`
`generateStaticParams` passed the pre-encoded string `'%23'`; Next.js encodes param values itself, so the file landed on disk as `%2523.html` and `/names/christian/letter/%23` — which is in the sitemap and linked from every Christian letter hub — was a guaranteed 404. Now passes the raw `#`. **→ 200.**

### 5. `middleware.js` (new)
301s every host you own to `https://nameverse.site`, preserving path + query. Covers `www.*` and `*.vercel.app` automatically, plus any host listed in `LEGACY_HOSTS`. Hosts you do **not** own pass through, so it can't be abused as an open redirect. *Not the fix I thought it was — but it makes the canonical-host behaviour explicit instead of relying on a platform default.*

### 6. `public/robots.txt` deleted
It conflicted with `app/robots.js` and they said different things (`public/` had no `Disallow` rules and pointed at `sitemap-index.xml`; the route handler had four `Disallow` rules and pointed at `sitemap.xml`). `next start` served one, Vercel served the other. One source of truth now.

---

## Before / after

| | Before | After |
|---|---|---|
| Sitemap URLs serving `noindex` | ~941 | **0** |
| Child sitemaps advertised that 404 | 1 | **0** |
| Sitemap URLs that redirect | 1 | **0** |
| `lastmod` | fabricated (build timestamp × 12,563) | **omitted** |
| Broken internal links | 18 found / 352 Italian linked site-wide | **0** (597-URL crawl) |
| robots.txt sources | 2 conflicting | **1** |
| Indexability disagreements | 1,919 records | **0** |
| Stale "42,000 names" claims | 4 places | **0** |
| Sitemap URLs (honest & consistent) | 12,438 (941 broken) | **11,624** (all verified 200 + index + self-canonical) |

Build passes all gates: `prerendered routes: 12617`, `indexable records: 11499`, `indexable records with prerendered HTML: 11499`, `PASS`.

---

## What you have to do now

**1. Google Search Console → Change of Address.** ⭐ *This is the one that matters.*
On the **`nameverse.vercel.app`** property: Settings → Change of Address → select `nameverse.site`. It tells Google to prioritise re-crawling the old host and transferring everything, instead of drifting through 14,000 redirects at the default rate. Both properties must be verified first. This is the single highest-value action left.

**2. Resubmit the sitemap** at `https://nameverse.site/sitemap.xml` in the **new** property. It is now clean — 11,624 URLs, every one verified 200 + `index,follow` + self-canonical, no `noindex` contradictions, no 404 children, no redirects, no fake `lastmod`. That gives Google a fast path to the live pages instead of making it re-crawl the old host.

**3. Fix the duplicate verification tag.** Every page emits two different `google-site-verification` values — `fB60sPZ-K1f5t10x-57z6f6_n655` (from `metadata.verification`) and `bY09F9IpVk_dzOagZu5xAzZwH9U-Io3IeuBeaBkfG0g` (hardcoded in `layout.jsx`'s `<head>`). One belongs to the old property. Delete the stale one after checking which.

**4. Decide about the ~28,500 deleted names.** If any of them had traffic, restore them — that is 28,500 pages of lost index. If they were junk, leave them: they 404 cleanly and will drop out. Do not redirect them to the homepage; that creates soft-404s, which is worse.

**5. Decide about Italian.** 352 empty stubs, nothing links to them now, they 404 cleanly. Either fill the data or remove the section — the homepage currently advertises *"352 names → Italian Names"* pointing at a hub with no children.

**6. Expect it to take a few more weeks.** Watch *Pages → Why pages aren't indexed* on `nameverse.site`. With Change of Address live and a clean sitemap, the number should start climbing within days — but "crawled" precedes "indexed", and 11,600 URLs does not happen overnight.

**7. Optional:** set `LEGACY_HOSTS=nameverse.vercel.app` in Vercel → Environment Variables. Not required — `middleware.js` already covers all `*.vercel.app` — but it makes the intent explicit.

**8. Check GSC → Indexing → Pages → "Not found"** on the `nameverse.site` property. That report lists every old URL that redirected into a 404. The letter-page shape is the one pattern I could confirm from the outside, but there may be others (old name-detail URLs, old hub shapes, query-string variants). That report is the definitive list — whatever else shows up there needs either a redirect to a real page, or to be allowed to 404.

---

## ⭐ The original cause: Vercel paused your site

This is the one that explains "not indexing from day one", and it is written down in this repository. From `scripts/verify-static.mjs`:

> "**The site was paused on Vercel because Fluid Active CPU hit 12h 15m against a 4h allowance.** The cause was a single line: the name detail route declared `dynamicParams = true` and prerendered only the top 4,000 names, so ~9,800 indexable pages were rendered on demand — each one re-running the full normalise + enrich + compose pipeline."

And from `lib/data/names-data.js`: on-demand renders cost *"60 ms of CPU for a cold render"*, and *"a single crawler walking the sitemap could trigger thousands of them."*

You confirmed you hit Vercel usage limits in August–September. Here is the full chain:

1. **3 months ago** you set `nameverse.site` as the production domain. Vercel starts 301ing `nameverse.vercel.app` → `nameverse.site`.
2. Google begins re-crawling the **14,000 indexed old URLs** and following each one to the new host.
3. Most of those pages were **not prerendered** — only 4,000 were. Each arriving request rendered the page from scratch at ~60 ms CPU.
4. Fluid Active CPU hit **12h 15m against a 4h allowance**. Vercel **paused the site**.
5. Google's crawler hits a paused/erroring host. It backs off hard, and a *brand new* domain that returns errors loses crawl trust very fast and recovers slowly.
6. `nameverse.site` freezes at ~400. `nameverse.vercel.app` keeps its 14,000, because Google never successfully completed the transfer.

Everything else on this page is a secondary amplifier — real, and now fixed, but not what broke it at the start:

- the sitemap you submitted was misleading (941 URLs serving `noindex`, a 404 child sitemap, fabricated `lastmod`)
- the legacy `/names/islamic/c` letter URLs redirected into 404s
- ~28,500 names are gone from the dataset

### Why the timing matters

The fix — `dynamicParams = false`, every page prerendered at build time — is in `HEAD`, and `HEAD` is what is deployed (the live sitemap's build timestamp matches the HEAD commit). **So the site only became reliably servable on 10 Oct, three days ago.**

That is good news: it means the last three months are not a mystery and not permanent damage. It also means **you should not expect results yet** — Google has barely seen a healthy `nameverse.site`.

### The important consequence

The traffic that broke the site is now essentially **free**. The migration sends Google to ~14,000 URLs; before, each one cost ~60 ms of server CPU, and the site collapsed under it. Now every one of them is a static file served from Vercel's CDN edge at **zero** Active CPU:

```
prerendered routes:      12,617
routes with ISR:              0
dynamic (ƒ) routes:           0
```

Google can re-crawl all 14,000 without touching your allowance. The thing that broke the migration cannot break it again — `verify-static.mjs` runs on every build and fails it if a dynamic route ever comes back.

---

## What to do now

1. **Confirm Vercel usage is healthy.** Vercel → Project → Usage. With everything static, Active CPU should now be near zero even under a full crawl. Do this before anything else — if it is still climbing, nothing below will work.
2. **GSC → Change of Address** on the `nameverse.vercel.app` property → `nameverse.site`. This raises the priority of re-crawling the old host. Highest-value click remaining.
3. **Resubmit `https://nameverse.site/sitemap.xml`.** It is clean now: 11,624 URLs, every one verified 200 + `index,follow` + self-canonical, no `noindex` contradictions, no 404 children, no redirects, no fake `lastmod`.
4. **Request indexing on 10–20 key pages** (homepage, the four tradition hubs, a few high-value names). Google processes these within days and it re-establishes that the host is alive.
5. **Check GSC → Indexing → Pages → "Not found".** That lists every old URL that redirected into a 404. The letter-page shape is the pattern I could confirm from outside; there may be others.
6. **Give it 2–4 weeks.** Crawl trust after a host that errored rebuilds slowly. Watch *Pages → Why pages aren't indexed* — "crawled" precedes "indexed".
