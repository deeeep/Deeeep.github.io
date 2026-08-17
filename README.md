# TET site — restructured for static hosting

This replaces the three standalone Claude Design exports (`index.html`,
`Fable-Chameleon.html`, `FullFables.html`, each 12–13MB) with the same three
pages split into real, cacheable files. Read `§4 Flags for Deepak` before
publishing — two of them need a decision, not just a file change.

## 1. What changed and why

The original files weren't plain HTML — they were Claude Design's "bundler"
preview format: a loading-spinner shell plus a giant embedded JSON manifest
that gets decoded and turned into `blob:` URLs in the browser on every single
page load. Nothing was cacheable across pages, and several things were
embedded far larger than they needed to be:

| Problem found | Fix applied |
|---|---|
| Google Fonts CSS shipped 5 language subsets (Latin, Latin-ext, Cyrillic, Cyrillic-ext, Vietnamese) for every weight, for a Dutch/French/English site | Kept Latin only |
| Several "different weight" font files were byte-identical copies of the same variable font | Deduplicated to one file per family/style |
| Three font families shipped as uncompressed variable **TTF** | Converted to **WOFF2** |
| Homepage hero + 8 talent illustrations were PNG, up to 3.9MB each | Converted to WebP (quality checked visually) |
| The 42 fable/chapter plate images were **duplicated in full** inside both `Fable-Chameleon.html` and `FullFables.html` | Extracted once into a shared `assets/plates/` folder |
| React, ReactDOM, and your two design-system component bundles were re-embedded as inline blobs on every page | Extracted to real `.js` files; React/ReactDOM are shared across all three pages |
| Everything above was **base64-encoded inside JSON**, which inflates binary data ~33% and cannot be cached, streamed, or compressed as effectively as a real file | All of it is now a real file with a real path |

Nothing about the *design* changed — this is the same markup, the same
component runtime (`dc-runtime`), the same data, rendering through the same
mechanism. I did not rebuild it in a new framework; I removed the packaging
layer around it. Every asset path was verified to resolve to a real file on
disk, and the runtime's page logic (all three files) was checked for valid
JavaScript syntax after editing.

## 2. Size comparison

| | Before | After (first load) | Notes |
|---|---|---|---|
| `index.html` | 12.1 MB | ~24 KB HTML + ~1.8 MB shared assets | fonts + hero + talent icons, no design-system bundle needed (homepage doesn't use one) |
| `Fable-Chameleon.html` | 12.8 MB | ~109 KB HTML + shared reader assets | |
| `FullFables.html` | 12.8 MB | ~117 KB HTML + **same** shared reader assets | |
| **Total (3 files, no dedup possible before)** | **35.9 MB** | **~9.7 MB total on disk**, and every asset below is cached after first fetch | |

Shared, cacheable asset footprint:
- Fonts: **1.2 MB** (was ~4.1MB+ of embedded base64 *per page* that used fonts — homepage and reader pages use different font sets, so this doesn't fully collapse to one number, but neither copy is duplicated again on repeat visits)
- Homepage images (hero + 8 talent marks): **1.1 MB** (was ~6.8MB as PNG)
- Fable/chapter plate images (42 images, shared): **7.0 MB**, fetched once, reused by both reader pages (was ~16.9MB *duplicated* across the two original files)
- JS runtime (dc-runtime × 2 builds, design-system bundles × 2, React, ReactDOM): **383 KB total**, shared across pages that use them

The practical effect: a visitor's *first* page load is roughly 90% smaller
than before. Every page load after that — including navigating from the
homepage to a fable, or between the two reader pages — reuses whatever's
already cached instead of re-downloading a fresh 12MB blob.

## 3. Structure

```
/
├── index.html                  Homepage
├── fable-chameleon.html        Chameleon fable landing page
├── full-fables.html            Full reader (all 8 fables) — see §4.2
├── robots.txt
├── README.md                   this file
└── assets/
    ├── css/
    │   ├── fonts-home.css      @font-face, Latin-only, homepage families
    │   ├── fonts-reader.css    @font-face, Latin-only, reader families
    │   └── styles-home.css     homepage design tokens (~5KB)
    ├── fonts/
    │   ├── home/                7 WOFF2 files (Libre Franklin, Playfair Display, EB Garamond, Caveat)
    │   └── reader/               5 WOFF2 files (Caveat, EB Garamond, Playfair Display)
    ├── images/
    │   ├── hero-tet.webp
    │   ├── fable-logos/          8 talent illustrations (WebP)
    │   └── talent-marks/         8 talent icon SVGs
    ├── plates/                  shared by both reader pages
    │   ├── covers/                8 chapter cover thumbnails + 8 "locked" variants
    │   ├── title-page/            2 images
    │   └── chapters/              24 images (wallpaper/plate/lock × 8 fables)
    └── js/
        ├── dc-runtime.js          used by index.html + full-fables.html
        ├── dc-runtime-legacy.js   used by fable-chameleon.html (different build — see note below)
        ├── ds-bundle-reader.js    shared by both reader pages (index.html uses no DS components, so no homepage bundle is shipped)
        ├── react.production.min.js
        └── react-dom.production.min.js
```

**Note on the two `dc-runtime` builds:** your exported files weren't all
built from the same version of this component runtime — `index.html` and
`FullFables.html` shipped one build, `Fable-Chameleon.html` shipped a
slightly different one. I kept both rather than forcing them onto a single
version, since I can't verify they're behaviourally identical and a silent
mismatch would be a worse failure mode than one extra 64KB file.

## 4. Flags for Deepak

### 4.1 `TET.html` and `index.html` were byte-identical duplicates
Your repo has both. I only rebuilt `index.html`; delete `TET.html` from the
repo (or keep it as a manual redirect if something external links to that
exact filename — but nothing in this project should).

### 4.2 The Long Night — removed from the shipped data, not just the UI
As requested, I removed *The Long Night* entirely from both reader pages'
data payload, not just from what's rendered:
- Its section (title, full text, reflection prompts) — deleted
- Its 5 associated images (cover, cover-lock, wash, plate, lock) — never
  extracted to disk at all
- The one reading-list bibliography entry that cited it by name — deleted
- A hardcoded array index in the Chameleon page's logic that pointed past
  it (pointing at the Reading List section) — corrected and syntax-verified

Before this fix, the original exports shipped the full Long Night text in
the page's JavaScript regardless of whether the UI displayed it — visible to
anyone who opened dev tools or viewed source. That's now closed.

### 4.3 `full-fables.html` — crawling/indexing
Two things are in place:
- `<meta name="robots" content="noindex, nofollow">` in the page's own `<head>`
- `robots.txt` disallowing `/full-fables.html` and `/assets/plates/`

**Important limits on what this actually does:** neither of these
*restricts access* — they ask well-behaved crawlers (Google, Bing, etc.) not
to index the page, and well-behaved scrapers not to follow it. Nothing
stops a browser, a curious visitor with the URL, or a scraper that ignores
robots.txt (a large share of content-scraping bots do ignore it) from
reading the page. No page on the site links to `full-fables.html`, so it's
an orphan reachable only by direct URL — that's meaningfully obscure but
not access-controlled.

If "almost never see the light" needs to mean something stronger than
"unlisted and asked-nicely-not-to-be-crawled," the reliable options are:
password-gating the page at the Cloudflare Pages level (Cloudflare Access
supports this on the free tier), or simply not deploying `full-fables.html`
to the public site until there's a real access-control layer in front of it.
I didn't make that call for you since it changes what the page is for.

### 4.4 Fonts: `dc-runtime` legacy build
See §3 note above — flagging again here since it's a "don't merge these"
decision, not just a file-organization one.

## 5. What I did *not* do

- I did not touch visual design, copy, layout, or component behavior —
  same runtime, same markup, same data, just repackaged.
- I did not attempt to reduce the 7MB of fable/chapter plate images further.
  I tested WebP re-encoding on samples and it made several of them *larger*
  than the originals (they're already efficiently compressed JPEGs) — so I
  left them as-is rather than force a "modern format" that would have
  regressed size.
- I did not merge the two `dc-runtime` builds into one (§3, §4.4).
- This is still the Claude Design output, not the Astro build from your
  locked roadmap (`TET_Website_Framework_Handoff_v1.md` §9). Treat this as
  a much lighter, cacheable version of the same design-reference artifact —
  not a replacement for the eventual Astro/Cloudflare Pages production build.

## 6. Recommended next step for hosting

Push this whole folder to the root of your GitHub Pages repo (replacing the
old three files and `TET.html`), keeping the `assets/` folder alongside the
HTML files exactly as structured here — the relative paths depend on that
layout. No build step is required; GitHub Pages / Cloudflare Pages will
serve these as static files as-is.
