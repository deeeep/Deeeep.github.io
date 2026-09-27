# Sync process — `site/` vs. local `/Users/deeeep/Documents/GItHub/Deeeep.github.io`

`site/` in this project is a working copy of the real production repo, pulled in
via the linked local folder. It is **not** auto-synced — Claude has no background
access to your disk, only what you explicitly re-share in chat.

## Before starting any edit to `site/`

1. Ask Claude to re-list the local folder (`local_ls` on the linked
   `Deeeep.github.io` folder) and compare file-by-file against what's in `site/`
   — same file names/paths, and a content check (`local_read` + `read_file`) on
   any file either side may have touched since the last sync.
2. Claude reports back any files that differ (locally changed since last pull,
   or changed here since last push) before making new edits — so you know what
   you'd overwrite in either direction.
3. Only then does Claude apply the requested change to `site/`.

## After Claude edits `site/`

Claude will list exactly which files changed. Copy those specific files back into
`/Users/deeeep/Documents/GItHub/Deeeep.github.io`, overwriting only those paths —
not a wholesale folder replace, to avoid clobbering anything you changed locally
in between (e.g. a real Ambassador-form test, a manual asset swap).

## What this does NOT do

There's no automatic diffing tool here — every check above is Claude re-reading
files on request, in the same turn as your edit request. If you make local edits
outside of a Claude turn (hand-editing files, running `rebuild_page.py` yourself),
say so next time before asking for a change, so Claude re-pulls first instead of
assuming `site/` is still current.

## Removed from the project (superseded by `site/`)

- `export/`, `github-drop-in/` — raw, unrebuilt Claude Design exports (the
  `_ds`/`support.js`-dependent format). These are what caused the earlier
  broken-page bug when copied into the production folder directly.
- Root `Fableworld (TET DS) - Standalone.html`, `Fableworld-src.html` — stale
  bundler exports, same format, no longer needed now that edits happen directly
  on `site/`'s real files.

Kept at project root: `Fableworld (TET DS).dc.html` (the editable design source,
used only for visual iteration in Claude's own preview) plus its `support.js`
and `_ds/`/`assets/` — unrelated to what ships to `deeeep.github.io`.
