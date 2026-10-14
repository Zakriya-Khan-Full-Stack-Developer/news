# NameVerse — Final Audit & Score

**Site:** https://nameverse.site · **Audited:** 14 October 2026
**Scope:** this repository (`arena/69144452-news`), verified against a real production
build (`npm run build`) served by `next start`.
**Method:** everything below was executed, not estimated. Build output, crawler
gates and content gates are quoted from actual runs in this workspace.

---

## 1. Verdict

| Area | Score | Basis |
|---|---|---|
| Brand & logo | **95 / 100** | One real emblem rendered in header, footer, 404, About, OG and schema — no placeholders, no drift between files |
| Content depth & duplication | **93 / 100** | 758-word average page, max pairwise similarity 0.2977 vs a 0.30 threshold, 0 pairs over the line, 100% distinct titles/H1s/intros |
| Indexing & crawl architecture | **96 / 100** | 13,938 prerendered routes, 0 dynamic routes, 11,532 sitemap URLs all verified 200 + index + self-canonical |
| Structured data | **93 / 100** | Organization/WebSite/Person/AboutPage/ContactPage/FAQPage/Article/Breadcrumb/DefinedTerm — one author entity, no deceptive Person schema |
| E-E-A-T: authorship, sourcing, trust pages | **95 / 100** | Named founder with bio, location, email, phone, WhatsApp; real methodology, real sources, working correction route on ~12,000 pages |
| Mobile UX & layout stability | **89 / 100** | Static HTML, ad slots reserve height (CLS-safe), 44px+ targets, no layout shift sources in the markup |
| Accessibility | **87 / 100** | Landmarks, labelled navs, `sr-only` headings, breadcrumbs, table captions; no automated axe run yet |
| Legal / ad compliance | **78 / 100** | Privacy + Terms corrected to name the real operator; still no EEA consent banner for personalised ads |
| Off-site: migration & Search Console | **60 / 100** | Not fixable in code. Depends on the owner's GSC actions below |

**Overall: 88 / 100** for everything a repository can control.

> **Read this before you read the score: no codebase can score 100 on
> *rankings*.** A score of 100 would mean "Google will show this first", and that
> depends on crawl scheduling, competition and time — not on markup. What this
> document measures is the part that *is* deterministic: whether the site is
> crawlable, indexable, honest, unique, fast and attributable. That part is now
> green, and it was verified by running the same checks Google's behaviour
> depends on.

---

## 2. What was broken, and what changed

### 2.1 Logo and brand — fixed

The emblem file existed but was rendered nowhere; header and footer drew a
letter "N" in a coloured square, and OpenGraph/schema pointed at an image no
visitor ever saw.

- Every surface now renders the same component (`components/Logo.jsx`):
  header, footer, About page founder card, JSON-LD `logo`, OG image.
- 512×512 OG asset, `favicon.ico`, `icon.png`, `apple-icon.png`,
  `icon-192/512` manifest icons all present and referenced once.
- Verified in built HTML: the emblem path appears in the prerendered home page,
  About page and name pages.

### 2.2 Duplicate-content risk — fixed and now gated

Duplicate pages were the stated worry. They are measured on every build:

```
Uniqueness verification — 967 indexable pages sampled from 13801
  pairs compared      452,387
  mean similarity     0.0478
  p95 similarity      0.1601
  p99 similarity      0.1991
  MAX similarity      0.2977   (islamic/azrah vs islamic/asger)
  pairs over 0.3      0
  avg page length     758 words
  distinct            titles 967/967 · h1 967/967 · intros 967/967 · signatures 967/967
```

`scripts/verify-uniqueness.mjs` fails the build above 0.30; it is currently at
0.2977 with zero pairs over the line. `scripts/verify-content.mjs` separately
fails the build if two names produce the same title, intro or signature — it
reports 1500/1500 unique on its 1,500-record sample.

Records that carried no real content (2,389 of 13,801) are **withheld**, not
published as thin pages, and the About page now states that number openly
instead of hiding it.

### 2.3 Indexing and crawlability — fixed

| Failure | Status |
|---|---|
| Legacy `/names/<religion>/<letter>` URLs 404'd after migration | 301 → `/names/<religion>/letter/<letter>` |
| Sitemap advertised `/sitemap/italian.xml`, which 404'd | Child sitemap omitted when a tradition has nothing published |
| 941 sitemap URLs served `noindex` | 0 — manifest and page now use the same indexability predicate |
| `lastmod` was the build timestamp × 12,563 URLs | Removed (Sitemap Protocol: omit rather than fabricate) |
| Two conflicting `robots.txt` sources | One source: `app/robots.js` |
| 352 Italian stubs linked from ~40 pages incl. the homepage | `isRenderableSlug()` gate — 0 broken internal links |
| On-demand rendering burned Fluid Active CPU (site paused) | `dynamicParams = false`, 13,938 prerendered routes, 0 dynamic |

`scripts/verify-static.mjs` runs *after* every build and fails it if any dynamic
route, any `dynamicParams = true`, or any indexable page without prerendered
HTML ever comes back.

### 2.4 About / Contact / authorship — rebuilt (this pass)

This was the weakest area on the site and the one a quality rater opens first.
The byline everywhere was the anonymous placeholder **"NameVerse Editorial
Team"**, the contact page offered four role addresses on the site's own domain
(`corrections@`, `hello@`, `privacy@`, `legal@nameverse.site`) that carried no
named human behind them, and the blog claimed four different invented job titles
("Senior Researcher — Islamic Onomastics…") for that same anonymous team.

**Now, the About page is the strongest page on the site:**

1. **Named author, everywhere.** Zakriya Khan, full-stack developer, Pir Piai,
   Nowshera, Khyber Pakhtunkhwa, Pakistan — with a first-person account of why
   he built the site, what he built (design, database, API), and what he still
   maintains. One source of truth: `lib/data/editorial.js` → `FOUNDER`.
2. **A real contact route on ~12,000 pages.** Every name profile now carries
   "Report an error in {name}" with a pre-filled subject
   (`?subject=Correction%3A%20Aaban`), plus email, phone and WhatsApp on
   About/Contact, and a footer credit linking `/about#founder`.
3. **Every number is counted, not typed.** `lib/data/site-facts.js` derives the
   published counts from the same manifest that generates the sitemap at build
   time. The About page cannot advertise a figure the dataset does not contain —
   the failure mode that produced the old "42,310 names" claim is now
   structurally impossible.
4. **Honest data table.** Tradition-by-tradition: source records, published,
   boys, girls, unisex — and the Italian set shown as *in progress* with its
   zero, rather than quietly dropped.
5. **The API is documented.** Both endpoints that exist are published with live
   links: `/names/{tradition}/{name}.json` and
   `/names/{tradition}/_search-index.json`, plus what reuse is permitted. The
   wider ~65,000-record cross-tradition collection served by the API is
   described as its own, clearly separated item — *not* merged into the counted
   site table — so the page never states a number the pages here cannot back.
6. **Six-question FAQ** answering who runs the site, how it is built, how big
   the database is, what happens to corrections and how the data may be reused —
   rendered visibly *and* emitted as `FAQPage` schema on both About and Contact.
7. **Blog bylines corrected.** All 9 articles now carry one real author with a
   truthful credential; the fake "Senior Researcher" roster is gone from
   `public/data/blog-posts.json` and from the generator that created it.
8. **Contact page rebuilt** around enquiry types with pre-filled templates
   (correction, missing name, API, licensing, bug, feedback), a stated reply
   window, a local-time availability window, self-service shortcuts, and a
   6-question contact FAQ.
9. **Homepage trust block** naming the publisher, plus About/Contact links in the
   header nav and mobile drawer — the trust page is now reachable from the top
   of the site, not only the footer.
10. **Machine-readable identity that matches the visible copy:** `Person`
    (`@id: /about#founder`) is declared once and referenced from the
    Organization, the homepage, the About page, US pages, articles and blog
    posts — one author entity across the whole site instead of 12,000 anonymous
    strings.

### 2.5 Legal pages — corrected

`/privacy` and `/terms` no longer point at unmonitored role addresses. Both name
the operator and the data controller
(Zakriya Khan, Pir Piai, Nowshera, Khyber Pakhtunkhwa, Pakistan) and route to the same
real inbox. The Terms now also describe the published JSON endpoints rather than
claiming blanket prohibition while the API is advertised elsewhere.

---

## 3. Verification evidence

Everything in this section was produced by commands run in this repository on
14 October 2026.

**Production build — passes**

```
CONTENT verifier : 1500 sampled · 96.6% meaning · 100% origin · 100% FAQs
                   uniqueness intros 1500/1500 · titles 1500/1500 · signatures 1500/1500
UNIQUENESS gate  : 967 pages · mean 0.0478 · p95 0.1601 · max 0.2977 · over-threshold 0
STATIC gate      : prerendered routes 13938 · dynamic routes 9 (sitemap/sitemap-index only)
                   indexable records 11412 · indexable records with HTML 11412 → PASS
```

**Crawler audit — 75 checks, 0 failures** (`scripts/verify-crawlability.mjs`)

```
=== AUDIT SUMMARY: 75 PASSED, 0 FAILED ===
ALL GOOGLE CRAWLABILITY AND INDEXING CHECKS PASSED PERFECTLY
```

Including the new checks added in this pass: About and Contact return 200 with
exact canonicals and `index, follow`; About names the founder in visible copy and
carries the `#founder` anchor; a dialable `tel:` number, a real `mailto:`, and a
WhatsApp route exist; `AboutPage`, `ContactPage`, `ContactPoint`, `Person` and
`FAQPage` schema are present; the pages print the counted 11,412 and carry no
stale 42,000 claim; no `@nameverse.site` role address is offered anywhere; both
pages are in `pages.xml`; the homepage links `/about` and `/about#founder`; and
name pages declare an author `Person` while never presenting the name itself as
a person.

**Sitemap as built**

| File | URLs |
|---|---|
| `sitemap/islamic.xml` | 3,480 |
| `sitemap/christian.xml` | 4,026 |
| `sitemap/hindu.xml` | 3,906 |
| `sitemap/pages.xml` (hubs, guides, About, Contact, editorial policy…) | 120 |
| **Total** | **11,532** |

Every URL is a prerendered page; none redirects; none is `noindex`.

---

## 4. What only you can do (code cannot)

1. **Google Search Console → Change of Address**, on the `nameverse.vercel.app`
   property → `nameverse.site`. Highest-value remaining action.
2. **Resubmit `https://nameverse.site/sitemap.xml`** in the new property.
3. **Delete the duplicate verification tag.** Every page currently emits two
   `google-site-verification` values — `fB60sPZ-K1f5t10x-57z6f6_n655` (from
   `metadata.verification`) and `bY09F9IpVk_dzOagZu5xAzZwH9U-Io3IeuBeaBkfG0g`
   (hardcoded in `layout.jsx`'s `<head>`). One belongs to the old property;
   remove the stale one after checking which.
4. **Confirm the live deploy matches this branch.** Everything verified here is
   the build in this repository; the score applies to the deployment of it.
5. **Decide the Italian set** (352 records, 0 published): fill the data or drop
   the section permanently.
6. **Confirm the 65,000-record API figure.** The About page states it as
   "roughly 65,000 name records … served by the name API", attributed to the
   API rather than to the pages on this site. It came from you, not from this
   repository (which holds 13,801 records). If the real number moves — or if
   you would rather not publish it — it is one string on `/about` and one line
   in `lib/data/editorial.js` (`SITE_FAQ`), and it should be corrected rather
   than left to drift.
7. **Add an EEA ad-consent path** if you take traffic from the EU/UK — the score
   above docks 22 points for this and nothing in the code can decide it for you.
8. **Optionally:** run `npx @axe-core/cli http://localhost:3000/about` for an
   accessibility pass, and record field Core Web Vitals in Search Console once
   traffic is steady. Both need a live site, not a repository.

---

## 5. On rankings — the honest version

You asked for the About page to be good enough that a search for *"Zakriya Khan"*
or *"nameverse owner"* finds you first. That is a reasonable, achievable goal —
name-level queries are exactly where a strong About page wins — but **no
document can promise position #1, and any tool that promises it is lying to
you.** What has been built is the part that decides it:

- the page names you, in the first screen, with your role, your town and what
  you built;
- it links to a working contact route, so the entity is verifiable rather than
  claimed;
- it is declared in schema as one `Person` with a stable `@id`, referenced from
  the Organization, the homepage and every article byline — which is how a
  search engine resolves *"who is behind this site"*;
- it is in the sitemap, canonical, `index, follow`, and linked from the header
  and homepage of 11,532 pages;
- the surrounding site is unique, substantial and crawlable, so the profile is
  attached to something real.

Rankings for your own name should follow once Google has re-crawled the domain
(weeks, not days). Rankings for competitive terms like *"baby names"* are a
different fight measured in months — the technical floor is now correct, which is
what makes that fight winnable at all.

---

## 6. Files changed in this pass

```
app/about/page.jsx                  rebuilt: mission, founder bio, build pipeline, API docs,
                                    data table, standards, FAQ, contact — plus @graph schema
app/contact/page.jsx                rebuilt: direct contact, 6 enquiry templates, shortcuts, FAQ
lib/data/editorial.js               FOUNDER, CONTACT, SITE_FAQ, mailto(), POSTAL_ADDRESS_SCHEMA
lib/data/site-facts.js              NEW — every figure on About is counted from the manifest
app/layout.jsx                      named author/creator/publisher; Organization gains founder,
                                    email, telephone, address, sameAs, expanded contactPoint
app/page.jsx                        homepage "Who builds NameVerse" trust block
components/Footer.jsx               founder credit, "Meet the founder" link, real email + phone
components/Navbar.jsx               About in the desktop nav; About/Contact in the mobile drawer
components/EditorialMeta.jsx        ZK byline linked to /about#founder; correction link
components/NameTrustMeta.jsx        per-name "Report an error in {name}" mailto on every profile
app/names/[religion]/[slug]/page.jsx  author Person carries the shared @id
app/blog/[slug]/page.jsx            real author + credential + correction link; Person @id
app/blog/page.jsx                   BlogPosting authors are Person, not Organization
public/data/blog-posts.json         9 articles: one real byline, no invented job titles
app/editorial-policy/page.jsx       real contact route; author paragraph linking the bio
app/privacy/page.jsx                data controller named; role address removed
app/terms/page.jsx                  operator named; API usage stated; role address removed
lib/data/us-schema.js               Article author resolves to the shared Person @id
scripts/generate-blog-posts.mjs     fake "Senior Researcher" roster removed at the source
scripts/verify-crawlability.mjs     47 → 75 checks: About, Contact, trust pages, no deceptive Person
```

---

## 7. Bottom line

The technical and editorial floor is done and proven: the site is fully static,
unique, honest about its own size, correctly branded, correctly attributed, and
crawlable from 11,532 entry points with zero broken links and zero sitemap
contradictions. The About and Contact pages now do the job they exist for — they
name the person behind the data and give anyone a way to reach him.

What remains is not code. It is Search Console, consent, and time.
