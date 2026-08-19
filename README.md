# TET site — restructured for static hosting

This replaces standalone Claude Design exports with real, linked, cacheable
static files. Current pages:

- `index.html` — homepage ("Fableworld") — also carries the book/journal
  showcase that used to live on a separate `products.html` (retired, see §4.6/§4.9)
- `fable-chameleon.html` — Chameleon fable landing page
- `full-fables.html` — full reader (all 8 fables) — see §4.2, not for crawling

Read `§4 Flags for Deepak` before publishing — some of them need a decision,
not just a file change.

**Update history:** this site has been rebuilt several times as new Claude
Design exports came in (nav toggle, then the talent/fable "constellation"
cross-linking feature, then the products page). Each rebuild reused
already-optimized fonts/images/JS wherever the new export's assets were
byte-identical to what was already here, rather than reprocessing from
scratch — see asset comments below for what's shared vs. page-specific.

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
├── index.html                  Homepage ("Fableworld")
├── fable-chameleon.html        Chameleon fable landing page
├── full-fables.html            Full reader (all 8 fables) — see §4.2
├── robots.txt
├── README.md                   this file
├── scripts/
│   ├── rebuild_page.py         reusable export→clean-page pipeline — see scripts/README.md
│   ├── asset_registry.json     hash→path memory the script reuses across runs
│   └── README.md               what the script does and doesn't cover
└── assets/
    ├── css/
    │   ├── fonts-home.css      @font-face, Latin-only — shared by all three pages (see §4.11)
    │   └── styles-home.css     homepage design tokens
    ├── fonts/home/              7 WOFF2 files (Libre Franklin, Playfair Display, EB Garamond, Caveat)
    │                             — single copy per family, shared/cached across all three pages
    ├── images/
    │   ├── fable-logos-small/  8 talent illustrations, homepage draggable constellation (WebP)
    │   ├── fable-wide/          8 wide fable-detail images, homepage overlay panel (WebP)
    │   └── products/            2 book/journal cover images, homepage companions section (WebP)
    ├── fable-bgs/                8 chapter background textures, homepage (WebP)
    ├── plates/                  shared by both reader pages, 25 files total
    │   ├── title-page/            1 image (wash.jpg — the title-page plate was a duplicate, see §4.11)
    │   └── chapters/              24 images (wallpaper/plate/lock × 8 fables, deduped — see §4.11)
    └── js/
        ├── dc-runtime.js          used by index.html and full-fables.html
        ├── ds-bundle-home.js      used by index.html (Badge/Button components)
        ├── ds-bundle-reader.js    shared by both reader pages
        ├── react.production.min.js
        └── react-dom.production.min.js
```

**Note on `ds-bundle-home.js`:** genuinely used by `index.html` now — the
companions section (Fables book / Friction Journal cards) uses the `Badge`
component for its "in development" status pills. This wasn't always true;
early on this file only existed on the homepage as unused dead weight
carried over from the same shared design-system export. It earned its
place once the homepage absorbed the book-showcase content that used to
live on a separate `products.html` page (retired — see §4.6/§4.9).

**Note on `dc-runtime`:** earlier exports weren't all built from the same
version of this component runtime — `index.html`/`full-fables.html` and
`fable-chameleon.html` briefly shipped two different builds. A later
export unified them; all three pages now load the same `dc-runtime.js`,
confirmed by content hash, not just filename.

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

### 4.5 Fixed: homepage was linking off-site for the fable
The Claude Design export for `index.html` had "Read the full fable →"
pointing at `https://deeeep.github.io/Fable-Chameleon.html` — the old,
externally-hosted, capitalized filename — instead of the local
`fable-chameleon.html` now living in this same folder. Fixed to a relative
link. Worth a quick look next time a new homepage export comes in, in case
Claude Design regenerates that absolute URL again.

### 4.6 Homepage image set changed — old fable-logos removed
The latest homepage export switched entirely from the original full-size
fable illustrations to smaller `fable-logos-small/` thumbnails (both for the
card list and, it looks like, the detail view too — the template no longer
references the full-size versions anywhere). I removed the now-orphaned
full-size files rather than ship unused weight. If a future export brings
back a use for the larger versions, they'll need re-extracting from that
export's manifest — I didn't keep a separate archive of them in this package.

### 4.7 Fixed: Ambassador form was pointing at dummy data
The version of `products.html` processed at the time had a **non-functional**
sign-up form: the submission target was the Google Form's `viewform` URL
(the page a person visits, not a submission endpoint) and all three field
IDs were obvious placeholders (`entry.111111111`, `entry.222222222`,
`entry.333333333`). It would not have worked if someone had submitted it.

That was fixed in a later export: the target became the real `formResponse`
endpoint, and the field IDs (`entry.1162102303` for name, `entry.2001919023`
for email, `entry.402786780` for motivation) matched the real Google Form.
The Ambassador form has since moved from its own page into a modal on the
homepage (§4.6/4.9) — same endpoint and field IDs, carried through and
re-verified at each rebuild since. Worth one real test submission after
deploying, since Claude can't submit the actual form to confirm from here.

### 4.8 Mobile nav + responsive layout added, and a copy fix
This update added a proper mobile experience to the homepage: a hamburger
menu (`toggleMenu`/`menuOpen` state, hidden above 780px), and several grid
layouts that switch from two-column to single-column on narrow screens via
a `window.resize` listener (`isMobile` state). All preserved and verified —
checked the resize listener is added in `componentDidMount` and cleaned up
in `componentWillUnmount` so it doesn't leak.

Also fixed: two places on the page read "TET does not sort people..." /
"TET is deliberately unfinished..." — now correctly render the mirrored-E
wordmark "TƎT", matching the locked brand identity. Good catch on Claude
Design's part; nothing for me to do here except confirm it carried through.

### 4.9 Homepage imagery regenerated (again)
All 18 non-shared images on the homepage (8 wide fable-detail shots, 8
background textures, 2 book/journal covers) were replaced with newer
versions — different art, generally smaller source files this time. The 8
small draggable "constellation" icons stayed the same image content (just
re-embedded under new UUIDs by the export), so those were reused rather
than reprocessed. Files were overwritten in place at their existing paths,
so no new orphans this round.

### 4.10 Known-harmless: `plate` field still points nowhere
Flagged in the previous rebuild (§ update log below) and still true here:
each fable's data object carries a `plate: 'assets/plates/{name}.png'`
field that's assigned but never read by any `{{ }}` binding in the
homepage's markup — confirmed again by tracing every `.plate` occurrence.
Not rendered, so not a real broken image, but if a future export adds a
visible use for it, those 8 files will need extracting fresh from that
export's manifest.
The version of `products.html` processed earlier had a **non-functional**
sign-up form: the submission target was the Google Form's `viewform` URL
(the page a person visits, not a submission endpoint) and all three field
IDs were obvious placeholders (`entry.111111111`, `entry.222222222`,
`entry.333333333`). It would not have worked if someone had submitted it.

The latest export fixes both: the target is now the real `formResponse`
endpoint, and the field IDs (`entry.1162102303` for name, `entry.2001919023`
for email, `entry.402786780` for motivation) match your actual Google Form.
I left the submission mechanism itself untouched — it builds a hidden form
and posts it to a hidden iframe, a standard no-CORS-safe pattern for
submitting to Google Forms from a static page with no backend — and only
verified the URL and entry IDs carried through correctly into this build
(checked byte-for-byte, plus a Node syntax check on the whole script).
Worth doing one real test submission after deploying, since I can't submit
the actual form from here to confirm the entry IDs are correctly labelled
in your Form (Anthropic's safety and privacy configuration prevent Claude
from submitting the actual form) — a live test after deploying is the way to be sure.

### 4.11 Cleanup pass: duplicate fonts, dead assets, duplicate plate images
Three things caught by inspection, not by a fresh export — worth recording
since they change what's on disk without changing what renders:

**Fonts.** `assets/fonts/home/` and `assets/fonts/reader/` held two
different files per family (Playfair Display, EB Garamond, Caveat) —
same family name, different weight ranges, confirmed by hashing every
file (none matched). Home's copies cover the full range each family
needs; reader's were a narrower subset. Consolidated: reader pages now
link `fonts-home.css` directly, `fonts-reader.css` and
`assets/fonts/reader/` are gone. One font file per family now, shared
and cached across all three pages instead of downloaded twice.

**`assets/images/talent-marks/`** (8 SVGs) — removed. Same dead-data
pattern as the `plate` field below: each talent object in `index.html`
carries a `mark: 'assets/images/talent-marks/...'` field, but nothing in
the markup ever binds it to a visible `<img>` — confirmed by searching
for any `{{ mark }}` or `.mark` template reference and finding none.
Since it's only ever a JS string literal, browsers never fetched these
files anyway; removing them just stops them sitting in the repo for no
reason. The dead `mark:` string in the data itself was left alone —
editing the data structure is more invasive than the actual problem
(unused files on disk) warranted.

**Duplicate plate images.** `assets/plates/covers/{name}-cover.jpg` was
byte-identical to `assets/plates/chapters/{name}-plate.jpg` for all 8
fables, and `{name}-cover-lock.jpg` identical to `{name}-lock.jpg` the
same way — Claude Design was reusing one source image at two display
sizes via CSS rather than shipping two files. `title-page/plate.jpg` was
also byte-identical to `chameleon-plate.jpg` — a three-way tie. Verified
every match by hash (not filename) before touching anything, confirmed
zero remaining references before deleting a single file, and re-ran the
Node syntax check on both reader pages' data scripts afterward.

Kept `chapters/{name}-plate.jpg` and `chapters/{name}-lock.jpg` as the
canonical files (they're the primary in-story images; the cover
thumbnails and the title page were the ones reusing them) and rewrote
every reference in both `fable-chameleon.html` and `full-fables.html`
to point there. `assets/plates/covers/` is gone entirely,
`title-page/plate.jpg` is gone (`title-page/wash.jpg` remains — that one
really is unique). 42 files → 25, ~7.0MB → ~4.0MB, and — more valuable
than the disk savings — a fable's cover thumbnail and its chapter opener
now genuinely share one cached download instead of fetching the same
image twice under two different URLs.

`scripts/asset_registry.json` was updated to match throughout (font
consolidation, talent-marks removal, plate canonicalization) so a future
run of `rebuild_page.py` won't reintroduce any of this duplication.

### 4.12 Fixed: real crash — `fable-chameleon.html` on click-through navigation
Reported symptom: `undefined is not an object (evaluating 'paragraphs.map')`,
only when navigating to the page by clicking the link from `index.html`,
never on a direct/cold page load, and never on `full-fables.html`.

Root cause, traced to an actual mistake earlier in this project, not a new
bug: `full-fables.html`'s markup wraps all its content-rendering in
`<sc-if value="{{ loaded }}">` guards, so nothing tries to read chapter
data until `componentDidMount` has populated it. `fable-chameleon.html`
has **no such guard anywhere** — it loops over `prefaceBeats`/`storyBeats`
unconditionally from the very first render, before `componentDidMount`
runs. It was relying entirely on the JS-side fallback object providing
safe empty defaults for those keys while data was still loading.

A prior Claude Design export simplified that fallback from a full object
(`{ loaded: false, prefaceBeats: [], storyBeats: [], ... }`) down to just
`{ loaded: false }`. When this was reviewed earlier in this project, it
was logged as a harmless simplification — "data will always be loaded... so
this branch essentially never fires in production" — which was wrong. The
branch fires on every single mount, for the brief window between initial
render and `componentDidMount`'s `setState`. On a cold page load that
window is usually short enough not to matter user-visibly. On a
click-through navigation from `index.html`, three scripts
(`dc-runtime.js`, `react.production.min.js`, `react-dom.production.min.js`)
are already warm in the browser cache and execute close to instantly,
which changes the relative timing enough to expose the race: the first
render actually paints with `prefaceBeats`/`storyBeats` undefined, and the
`StoryText` component's internal `paragraphs.map(...)` throws.

**Fix:** restored the full defensive fallback object. Verified the file's
data script still parses (Node syntax check) and every asset reference
still resolves. This is a one-line, low-risk fix that reverses exactly the
change that introduced the regression — it does not touch the markup or
the templating logic, which I'm not confident enough in this custom
engine's exact semantics to safely restructure.

**What I got wrong the first time:** I accepted that earlier simplification
without checking whether the page's markup had a `loaded` guard the way
`full-fables.html` does. It didn't, and I didn't verify that before calling
the change equivalent. Worth remembering for future "minor code
simplification, functionally equivalent" calls — equivalence claims about
async initialization order need the actual render path checked, not just
inferred.

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
