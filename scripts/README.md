# `scripts/rebuild_page.py` — what it actually does

This script automates the mechanical, repeatable part of turning a fresh
Claude Design export into a clean page for this site: decoding the bundler
manifest, matching assets against everything already known (by content
hash, so it survives Claude Design reshuffling UUIDs on every export),
optimizing genuinely new assets, and stripping the bundler shell.

**Read this before you run it on something new.** It was built and tested
against real exports in this session, and it's honest about where it works
and where it doesn't — please don't extend that confidence further than
what's actually verified below.

## Verified to work: pages built like the homepage

`index.html` uses the standard Claude Design pattern: every image is its
own entry in the bundler manifest, referenced by UUID. For pages like this,
the script:

- Reuses every asset already in `asset_registry.json` by content hash
- Optimizes and registers anything genuinely new (fonts: Latin-subset
  filtered, TTF converted to WOFF2; images: converted to WebP)
- Strips the manifest/template/loading-shell wrapper entirely
- Wires in the real `assets/` paths, the fonts stylesheet, and the
  `dc-runtime.js` + React/ReactDOM resource shim
- Validates: no leftover UUIDs, every asset reference resolves to a real
  file, and the embedded page logic passes a Node syntax check

**Tested twice this session** against two different real Fableworld
exports, and the output was byte-identical to the hand-built version
(down to one cosmetic comment string, since fixed). This is genuinely
"export → run script → get a clean page" for this page type.

## NOT yet handled: the reader pages

`fable-chameleon.html` and `full-fables.html` are built completely
differently. All 47 fable plate/cover images are base64-encoded **inside
the JavaScript story-data text itself** — not separate manifest entries
the way the homepage's images are. This script has no logic to:

- Find and extract those embedded images from the data-script text
- Hash-match them against the registry
- Rewrite the data structure to reference real file paths
- Remove *The Long Night* from the data (a locked project requirement —
  see the main site `README.md` §4.2)

I confirmed this the hard way: running the script against a real
`full-fables.html` export produced an 11MB file, barely smaller than the
12.7MB original, with Long Night still in it. The script correctly did
the small piece it knows how to do (fonts, dc-runtime, ds-bundle swap) and
silently left the actual content untouched — which is a genuinely
dangerous failure mode if you don't know to check for it, so: check for it.

**What this means practically:** if Claude Design only changes something
runtime-level on a reader page (like the shared `dc-runtime.js` build, as
happened once this session), you can still hand-patch the two or three
resulting UUID references directly — that took under a minute by hand and
isn't worth scripting. If Claude Design changes the actual *content*
(new/different images, edited story text), that page still needs the full
manual treatment: decode the manifest, extract the data-script text,
replace the base64 blobs with placeholder tokens, evaluate the resulting
structure in Node to get real JSON, strip Long Night, re-embed with real
paths. That's a real chunk of work — a future session (or Claude Code,
working directly in this repo) would need to extend this script with a
second code path for that format before it's genuinely a "just run it"
tool for reader-page content updates too.

## Usage (for pages it does cover)

```
python3 scripts/rebuild_page.py \
    --export /path/to/downloaded_export.html \
    --page index.html \
    --role home
```

`--role` picks the font stylesheet and head wiring: `home` for
`assets/css/fonts-home.css`, `reader` for `assets/css/fonts-reader.css`.

Always read the printed summary before trusting the output — it tells you
how many assets were reused vs. newly processed, flags anything "missing
on disk" for manual review (some of these are expected and harmless — see
the script's own comments), and runs a Node syntax check. If the reused
count looks suspiciously low for a page that shouldn't have changed much,
that's worth investigating before you ship it.
