> **Historical report.** This document describes the site at the time it was written. Page counts, findings and recommendations may be out of date — see `README.md` for the current state (last reviewed 2026-10-17).

# Deep audit: content presentation, headings, metadata, brand

Audited: 38 representative pages of live HTML + a crawl of 608 internal URLs.
Fixed in commit `3a18027`. Every fix is at the source, so it applies to all
~12,700 pages rather than being patched page by page.

---

## 1. The worst finding: the site was publishing its own instructions

**Half of all name pages (899 of 1,798 sampled) rendered internal editorial
guard text as visible content.**

The dataset annotates most `note` fields with instructions written for whoever
compiles the entry. Those instructions were going straight onto the page:

> "No celebrity association should be generated without verification."
> "Letter-based personality systems should not be presented as factual
> properties of the name."
> "Numerological values should not be presented as linguistic, historical…"
> "A specific historical person bearing this name should not be invented…"

Correct guidance inside a source file. On a published page it is precisely the
kind of text that reads as machine-generated — to a reviewer and to a quality
classifier alike.

**Fix** — `scrubEditorGuards()` in `lib/data/name-normalizer.js` walks the
record and strips anything matching `EDITOR_GUARD`. It deliberately does **not**
match substantive hedges like:

> "Aaban should not be classified as a Quranic personal name without a direct
> Quranic basis."

That is an honest answer for a reader, so it survives. The distinction is
meta-language about how to write versus a real claim about the name.

Also dropped: serialised booleans and nulls (`False`, `None`) that appeared
both on their own and welded onto the end of otherwise good sentences
(`"…without a direct Quranic basis. False"`).

## 2. Every quoted paragraph was missing its closing quote

`dedupeProse()` splits prose with `/[^.!?]+[.!?]*/g`. That regex ends a
sentence on `.`, so `…month.”` becomes `…month.` **plus** a separate `”`
fragment. The dedupe key is `text.replace(/[^a-z0-9]/g, '')` — for `”` that is
an empty string, and empty keys are skipped. The closing quote was deleted.

Result: `“A life that reflects the positive sense of aaban…month.` with no
terminating quote, on effectively every page that quotes anything — 100% of
sampled records before the fix, 0.3% after (the remainder is source data that
was already unbalanced).

**Fix** — re-attach punctuation-only fragments to the sentence they were cut
from instead of dropping them.

## 3. Wrong data in the wrong field

`semantic_field.related_concepts` holds **concepts**, not sibling names. For
`aaban` it is `["aaban; the eighth persian month"]` — the gloss. It was merged
into `similar`, so "Similar sounding names" printed the meaning as if it were a
name, on ~5,000 pages (36.9% of records carry the field).

Variants had the same class of bug: `["Aaban", "aaban", "aban"]` — two
case-only duplicates of the entry's own name.

**Fix** — `uniqNameLike()` keeps only name-shaped strings: 2–32 chars, one or
two alphabetic words, no sentence punctuation, not the entry's own name,
de-duplicated case-insensitively. `aaban` now correctly shows `aban`.

## 4. Heading structure

| Page | H3s before | H3s after |
|---|---|---|
| `/origins/arabic` | 304 | 4 |
| `/islamic-boy-names` | 304 | 4 |
| `/names/islamic/letter/a` | 304 | 4 |
| `/muslim-baby-names-america` | 137 | 17 |
| `/unique-baby-names` | 136 | 16 |
| `/biblical-baby-names` | 134 | 14 |
| `/name-meanings` | 104 | 4 |

`NameCard` defaulted every card to `<h3>`, so each name in a 300-name grid
entered the document outline as a sibling section heading. Google reads that as
a page with no discernible structure.

**Fix** — the default is now `<p>`. The cards are list items; the H2 above the
grid is the heading and the name is the link text.

## 5. Presentation defects

- **Empty promises.** The "Notable Namesakes / People named X" section rendered
  whenever a bare `story` existed, producing a shell with a "Name story" label
  and no namesakes. Split: the namesakes claim requires actual names; a story
  alone now renders under its own honest "How X is used" heading.
- **The logo was nowhere.** Navbar and footer both drew a bare letter "N" in a
  coloured square. The real `nameverse_logo_emblem.webp` existed but was
  referenced only in metadata and JSON-LD. Added `components/Logo.jsx`, wired
  into both, with explicit width/height (no layout shift), `loading="eager"` +
  `fetchPriority="high"` for LCP, and descriptive alt text.
- **No favicon, no apple-touch-icon, no web manifest at all.** Added
  `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `app/manifest.js`,
  `public/icon-192.png`, `public/icon-512.png` — all generated from the real
  logo.

## 6. Metadata

| Defect | Before | After |
|---|---|---|
| `og:image` missing | 13 of 15 `openGraph` blocks | 0 |
| `twitter:card = summary` | 28 of 38 sampled pages | 0 (all `summary_large_image`) |
| `… \| NameVerse \| NameVerse` | 6 pages | 0 |
| Titles over 65 chars | 18 sampled + ~500 name pages | 0 |
| "42,000+ names" claim | 13 files | corrected to 11,632 |

Two of these deserve calling out:

**The duplicated brand.** The layout applies `title.template: '%s | NameVerse'`,
but six pages hardcoded the suffix in their own title, so the SERP showed
`Search Baby Names by Meaning, Origin & Tradition | NameVerse | NameVerse`.

**The false count.** The site advertised "over 42,000 baby names" — roughly 3×
what the dataset holds (11,632 records). That was on the About page, the search
page, the terms page and the search UI. A claim you cannot back is worse than no
claim, especially on a site whose whole pitch is verified data.

**Name-page titles** now carry a 53-character budget (53 + 12 for the template =
65), falling back `Name Meaning & Origin` → `Name Meaning` → bare name. Verified
across all 13,449 name pages: longest is exactly 65, zero over.

## 7. Link integrity

`resolveNameLink()` used `knownSlugsMap`, which lists every record including the
canonical duplicates the detail route deliberately does not prerender. With
`dynamicParams = false` those are hard 404s. `NameCard` already guarded against
this; the related-name chips did not, so `/names/islamic/adem` linked to the 404
`/names/islamic/man`. Now uses `isRenderableSlug()`.

**Live crawl of 608 internal URLs: 0 broken.**

---

## The formula, applied consistently

1. **One H1** per page, carrying the primary keyword and nothing else.
2. **H2s are sections.** Everything on the page belongs to exactly one.
3. **H3s are subsections of an H2** — a handful, never hundreds of siblings.
   A grid of items is a list, not a set of headings.
4. **Title ≤ 65 chars**, primary keyword first, brand last (exactly once).
5. **Description 70–320 chars**, unique per page, reads as a sentence.
6. **`twitter:card = summary_large_image`** everywhere, with a sized image.
   `og:image` on every page that has an `openGraph` block.
7. **Canonical** on every indexable page; `noindex` only where intended.
8. **The logo in the document**, not just in metadata — header, footer,
   favicon, apple-touch-icon, manifest, OG image and JSON-LD `Organization`.
9. **Never publish process instructions.** If a string tells a writer what to
   do, it does not belong on a page.
10. **Verify claims against the data.** Counts, totals and "over N" statements
    must be generated from the dataset, not hardcoded.

---

## Verify after deploy

```
# headings + metadata on 38 representative pages
node scripts/audit  # or re-run the ad-hoc probe used for this audit

# full internal link graph
# expect: crawled N internal URLs, BROKEN internal links: 0
```

## 8. Internal link graph — the biggest indexing lever

Before: **2,705 of 11,632 name pages (23%) had zero internal links.** A crawler
following links can never reach them, and with no inbound equity they are the
last pages Google would ever bother with. Worse, 75.9% of the pages that *were*
linked had exactly one.

Cause: `app/names/[religion]/letter/[letter]/page.jsx` rendered
`names.slice(0, 300)`. That cap was deliberate and correct — a single page
holding all 975 "a" names was heavy enough to crash mobile browsers — but
truncation meant everything past rank 300 of its letter had no home at all.

Fix: **paginate instead of truncate.** Page 1 keeps its existing, already
indexed URL and its safe 300-card size; the remainder moves to
`/names/[religion]/letter/[letter]/page/2…N`, linked by
`components/LetterPagination.jsx` and listed in the sitemap. Cost: **21 extra
routes**, ~3 MB of HTML.

Result: **orphans 2,705 → 0** (11,632 of 11,632 name pages reachable). Live
crawl of 655 internal URLs: 0 broken.

## 9. Empty hubs that were being submitted as real pages

The Italian set holds 352 records and **not one has content** — yet the site
advertised it in five places. `/names/italian` rendered "352 names · 0 boys ·
0 girls" with every card an unlinkable "soon" stub, and it was `index, follow`
and in the sitemap.

The sitemap now applies one rule everywhere: **a hub is listed only if it has
at least one publishable record.** Removed:

| URL | What it actually rendered |
|---|---|
| `/names/italian` | "352 names · 0 boys · 0 girls", 0 linkable |
| `/italian-boy-names`, `/italian-girl-names` | empty |
| `/categories/italian`, `/origins/italian` | 352 names, 0 linkable |
| `/categories/islamic` | "0 names" |

The homepage tradition grid is filtered the same way, so it no longer promotes
Italian as one of its pillars, and its counts now show publishable names rather
than raw records.

## 10. Correcting the public count

The site claimed "over 42,000 baby names" (13 files). The dataset holds 13,801
records — but only **11,632** render as pages a visitor can open; the rest are
stubs and canonical duplicates. Public copy now says 11,632, the homepage
derives it from the manifest at render time, and "four traditions" became
"three" where Italian is empty.

---

## Still open — needs you, not code

- **Two GSC verification tokens** in `app/layout.jsx` (`fB60sPZ…` via
  `metadata.verification`, `bY09F9IpVk_…` hardcoded in `<head>`). Google
  accepts a page if *any* matching token is present, so both work — but one is
  stale. I left both rather than risk deleting the live one. Remove the wrong
  one once you have confirmed which property is active.
- **GSC Change of Address:** `nameverse.vercel.app` → `nameverse.site`.
- **Resubmit** `https://nameverse.site/sitemap.xml` (now 11,753 URLs across 4
  child sitemaps, every one backed by real content).
- **Set `nameverse.site` as the Netlify primary domain** — this replaces the
  canonicalisation that the deleted `middleware.js` used to do, without costing
  an Edge Function invocation on every request.
