#!/usr/bin/env python3
"""
rebuild_page.py — turn a Claude Design standalone export into a clean,
linked page in the TET static site, reusing already-known assets instead
of re-extracting/re-optimizing them every time.

WHAT THIS IS
------------
Claude Design's "standalone" export isn't plain HTML — it's a loader shell
wrapped around a huge embedded JSON manifest (every image, font, and JS
library re-encoded as base64) that gets unpacked into blob URLs in the
browser at runtime. That's why the exports are 6-25MB and share nothing
between pages. This script reverses that: it decodes the manifest, checks
each asset against a registry of everything already extracted from past
exports (by content hash, not filename — Claude Design reshuffles the
internal UUIDs on every export even when the actual asset is unchanged),
reuses whatever matches, and only does real work (optimize + save +
register) for assets that are genuinely new.

USAGE
-----
    python3 rebuild_page.py \\
        --export /path/to/Downloaded_Export.html \\
        --page index.html \\
        --role home

    --page          output filename inside the site root (e.g. index.html,
                    fable-chameleon.html, full-fables.html)
    --role          which font stylesheet + head wiring to use:
                      home    -> assets/css/fonts-home.css   (+ no reader ds-bundle)
                      reader  -> assets/css/fonts-home.css (+ ds-bundle-reader.js)
                                 (reader pages share the home font files/stylesheet
                                 as of the font-consolidation cleanup -- see main
                                 site README §4.11 -- there is no separate
                                 fonts-reader.css or fonts/reader/ folder anymore)
                    (products.html was retired; if a similar future page
                    needs its own token set, add a role for it below)
    --site-dir      path to the site root (default: ../.. relative to this
                    script, i.e. the repo root if this script lives at
                    scripts/rebuild_page.py under the repo)
    --registry      path to the asset registry JSON (default:
                    scripts/asset_registry.json next to this script)
    --dry-run       do everything except write the final HTML file

WHAT IT DOES NOT FULLY AUTOMATE
--------------------------------
- Brand-new images (not a hash match to anything in the registry) get
  converted to WebP with a reasonable default quality and a note in the
  run summary — always spot-check new art visually before shipping;
  quality/transparency needs occasionally need a manual redo (see the
  README for the "transparency got flattened to black" mistake this
  caught once, worth remembering).
- Brand-new font families the registry has never seen. The script will
  save them (Latin-subset filtered, TTF converted to WOFF2) but you
  should sanity-check the family/weight declarations against the
  generated CSS.
- Structural markup changes (new sections, new components, new JS state)
  aren't something a script should "clean up" — those pass through
  untouched from the export, which is correct: only the packaging layer
  is being stripped, never the actual design/logic.
- New R()-fallback path *patterns* the registry hasn't seen before (i.e.
  a new naming convention, not just a new filename within a known one)
  need a one-line addition to FALLBACK_PATH_FIXES below.

Run with --dry-run first on anything unfamiliar, and always look at the
run summary before trusting a rebuild blind.
"""

import argparse
import base64
import gzip
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    from fontTools.ttLib import TTFont
except ImportError:
    TTFont = None


# ---------------------------------------------------------------------------
# Known R()-fallback path patterns: (literal path fragment in export) -> how
# to fix it once we know the real site structure. Add to this list whenever
# a new pattern shows up in an export that the registry can't already cover.
# ---------------------------------------------------------------------------
FALLBACK_PATH_FIXES = [
    ("../../assets/", "assets/"),
    ("assets/talent-marks/", "assets/images/talent-marks/"),
]

# fable-bgs and fable-logos fallback strings end in the wrong extension
# once we've converted the underlying image to WebP; fixed generically
# by extension-swap after the base path is already correct.
FALLBACK_EXTENSION_FIXES = [
    (re.compile(r"(assets/fable-bgs/[\w-]+)\.jpg"), r"\1.webp"),
    (re.compile(r"(assets/(?:images/)?fable-logos(?:-small)?/[\w.-]+)\.png"), r"\1.webp"),
]

STALE_COMMENT_PATTERNS = [
    # Orphaned Google-Fonts subset-label comments left behind once the
    # @font-face rules that used to follow them are stripped.
    re.compile(
        r"(?:/\*\s*(?:cyrillic|cyrillic-ext|latin|latin-ext|vietnamese|greek|greek-ext)\s*\*/\n?){2,}"
    ),
    # The stale "we load these fonts from Google" prose comment that
    # predates self-hosting — safe to replace wherever it appears.
    re.compile(
        r"/\* ─── FABLES OF TET — WEBFONTS.*?without inventing a substitute typeface\. \*/\s*",
        re.DOTALL,
    ),
]

ROLE_HEAD = {
    "home": {
        "fonts_css": "assets/css/fonts-home.css",
        "extra_links": [],
    },
    "reader": {
        "fonts_css": "assets/css/fonts-home.css",
        "extra_links": [],
    },
}


def md5(b: bytes) -> str:
    return hashlib.md5(b).hexdigest()


def decode_bundle(html_text: str):
    """Pull the three __bundler/* script blocks out of a standalone export."""
    scripts = re.findall(r"<script([^>]*)>(.*?)</script>", html_text, re.DOTALL)
    manifest_raw = template_raw = extres_raw = None
    for attrs, body in scripts:
        if "__bundler/manifest" in attrs:
            manifest_raw = body
        elif "__bundler/template" in attrs:
            template_raw = body
        elif "__bundler/ext_resources" in attrs:
            extres_raw = body
    if manifest_raw is None or template_raw is None:
        raise SystemExit(
            "Could not find __bundler/manifest or __bundler/template script "
            "blocks. Is this actually a Claude Design standalone export?"
        )
    manifest = json.loads(manifest_raw)
    template = json.loads(template_raw)
    ext_resources = json.loads(extres_raw) if extres_raw else []

    decoded = {}
    for uuid, entry in manifest.items():
        raw = base64.b64decode(entry["data"])
        if entry.get("compressed"):
            raw = gzip.decompress(raw)
        decoded[uuid] = (raw, entry["mime"])
    return decoded, template, ext_resources


def optimize_new_font(raw: bytes, mime: str, out_dir: Path, hint_name: str) -> Path:
    """A genuinely new font asset: convert TTF->WOFF2 if needed, save it."""
    out_dir.mkdir(parents=True, exist_ok=True)
    if mime == "font/ttf":
        if TTFont is None:
            raise SystemExit("fontTools not installed; cannot convert new TTF fonts to WOFF2.")
        tmp_in = out_dir / f"_tmp_{hint_name}.ttf"
        tmp_in.write_bytes(raw)
        font = TTFont(str(tmp_in))
        font.flavor = "woff2"
        out_path = out_dir / f"{hint_name}.woff2"
        font.save(str(out_path))
        tmp_in.unlink()
        return out_path
    else:
        out_path = out_dir / f"{hint_name}.woff2"
        out_path.write_bytes(raw)
        return out_path


def optimize_new_image(raw: bytes, out_dir: Path, hint_name: str, quality: int = 87) -> Path:
    """A genuinely new image asset: convert to WebP, preserving alpha."""
    if Image is None:
        raise SystemExit("Pillow not installed; cannot convert new images to WebP.")
    out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(__import__("io").BytesIO(raw))
    out_path = out_dir / f"{hint_name}.webp"
    img.save(str(out_path), "WEBP", quality=quality, method=6)
    return out_path


def find_r_fallback_refs(template_text: str):
    """
    Find R('id', 'fallback/path') calls -- these are the pattern Claude
    Design uses for assets that *may* come from window.__resources but
    fall back to a literal relative path when it isn't set (which, once
    we strip the whole bundler/bloburl system, is always the case -- so
    the fallback path is what actually gets used in our build).
    """
    return re.findall(r"R\('([\w-]+)',\s*'([^']+)'\)", template_text)


def build_report(reused, new_fonts, new_images, new_other, missing_registry_paths):
    lines = []
    lines.append(f"Reused from registry: {len(reused)} assets")
    if new_fonts:
        lines.append(f"NEW fonts processed:  {len(new_fonts)} -> {[p.name for p in new_fonts]}")
    if new_images:
        lines.append(f"NEW images processed: {len(new_images)} -> {[p.name for p in new_images]}")
    if new_other:
        lines.append(f"NEW other assets:     {len(new_other)} -> {[p.name for p in new_other]}")
    if missing_registry_paths:
        lines.append(
            "\nWARNING: these registry paths were referenced but don't exist on disk "
            "-- something is inconsistent between the registry and the site folder:"
        )
        for p in missing_registry_paths:
            lines.append(f"  - {p}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--export", required=True, help="Path to the downloaded standalone export HTML")
    ap.add_argument("--page", required=True, help="Output filename, e.g. index.html")
    ap.add_argument("--role", required=True, choices=list(ROLE_HEAD), help="Which head/font wiring to use")
    ap.add_argument("--site-dir", default=None, help="Path to the site root (default: repo root above this script)")
    ap.add_argument("--registry", default=None, help="Path to asset_registry.json")
    ap.add_argument("--dry-run", action="store_true", help="Do everything except write the final HTML")
    args = ap.parse_args()

    script_dir = Path(__file__).resolve().parent
    site_dir = Path(args.site_dir) if args.site_dir else script_dir.parent
    registry_path = Path(args.registry) if args.registry else script_dir / "asset_registry.json"

    registry = json.loads(registry_path.read_text()) if registry_path.exists() else {}

    export_text = Path(args.export).read_text(encoding="utf-8", errors="ignore")
    decoded, template, ext_resources = decode_bundle(export_text)

    print(f"Decoded {len(decoded)} embedded assets from export.")

    # --- Clean the template ---
    t = template

    # Strip every @font-face block FIRST, before any uuid substitution.
    # This matters: the manifest contains a font blob for every single
    # language-subset/weight combination Google Fonts ever generated (30-90+
    # per export), but only the ones actually needed (Latin, one weight-range
    # per family) are worth keeping. The rest exist *only* inside these
    # @font-face rules -- once stripped, their UUIDs never appear anywhere
    # else in the page, so they need no path substitution and are safe to
    # skip entirely rather than wastefully "optimizing" 25+ font files that
    # nothing will ever load. Any UUID still present in the template *after*
    # this strip is a real, live reference (image, script, or -- rarely -- a
    # font referenced directly outside a @font-face rule).
    t = re.sub(r"(?:/\*[\w-]*\*/\s*)?@font-face\s*\{[^}]*\}\s*", "", t, flags=re.DOTALL)
    live_uuids = {u for u in decoded if u in t}

    reused, new_fonts, new_images, new_other, skipped_dead_fonts = [], [], [], [], []
    uuid_to_path = {}

    for uuid, (raw, mime) in decoded.items():
        if uuid not in live_uuids:
            if mime in ("font/woff2", "font/ttf"):
                skipped_dead_fonts.append(uuid)
            # Non-font, non-live assets shouldn't really occur (every image/
            # script UUID we care about is referenced somewhere), but if one
            # shows up, silently skipping is correct: nothing in the cleaned
            # template will ever ask for it.
            continue

        hh = md5(raw)
        if hh in registry:
            uuid_to_path[uuid] = registry[hh]["path"]
            reused.append(uuid)
            continue

        # Genuinely new AND actually referenced -- optimize, save, register.
        hint = uuid[:8]
        if mime in ("font/woff2", "font/ttf"):
            out_dir = site_dir / "assets" / "fonts" / args.role
            out_path = optimize_new_font(raw, mime, out_dir, hint)
            rel = out_path.relative_to(site_dir).as_posix()
            registry[hh] = {"path": rel, "type": "font-new"}
            uuid_to_path[uuid] = rel
            new_fonts.append(out_path)
        elif mime in ("image/png", "image/jpeg"):
            out_dir = site_dir / "assets" / "images" / "_new"
            out_path = optimize_new_image(raw, out_dir, hint)
            rel = out_path.relative_to(site_dir).as_posix()
            registry[hh] = {"path": rel, "type": "image-new"}
            uuid_to_path[uuid] = rel
            new_images.append(out_path)
        else:
            out_dir = site_dir / "assets" / "js" / "_new"
            out_dir.mkdir(parents=True, exist_ok=True)
            ext = ".js"
            out_path = out_dir / f"{hint}{ext}"
            out_path.write_bytes(raw)
            rel = out_path.relative_to(site_dir).as_posix()
            registry[hh] = {"path": rel, "type": "other-new"}
            uuid_to_path[uuid] = rel
            new_other.append(out_path)

    # Direct uuid -> real path substitution (covers <script src="UUID">,
    # <img src="UUID">, and from="UUID#/_ds_bundle.js" patterns alike --
    # a plain string replace is safe and correct for all of these).
    for uuid, path in uuid_to_path.items():
        t = t.replace(uuid, path)

    # Fix R() fallback path prefixes/extensions for assets that use the
    # fallback-string pattern rather than direct uuid substitution.
    for old, new in FALLBACK_PATH_FIXES:
        t = t.replace(old, new)
    for pattern, repl in FALLBACK_EXTENSION_FIXES:
        t = pattern.sub(repl, t)

    # Remove now-orphaned comment cruft.
    fonts_css_hint = ROLE_HEAD[args.role]["fonts_css"]
    for pattern in STALE_COMMENT_PATTERNS:
        t = pattern.sub(
            f"/* Webfonts: self-hosted locally, Latin subset only. See {fonts_css_hint} */\n\n"
            if "WEBFONTS" in pattern.pattern
            else "",
            t,
        )

    # Remove the dc-runtime script tag from <head> -- we re-inject it below
    # alongside the fonts stylesheet and the React/ReactDOM resource shim.
    dc_runtime_path = None
    for uuid, path in uuid_to_path.items():
        if path.endswith("dc-runtime.js") or path.endswith("dc-runtime-legacy.js"):
            dc_runtime_path = path
            t = re.sub(rf'<script src="{re.escape(path)}"></script>\n?', "", t)
            break

    role_cfg = ROLE_HEAD[args.role]
    head_bits = [f'<link rel="stylesheet" href="{role_cfg["fonts_css"]}">']
    head_bits.append(
        "<script>\n"
        "window.__resources = {\n"
        '  "https://unpkg.com/react@18.3.1/umd/react.production.min.js": '
        '"assets/js/react.production.min.js",\n'
        '  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": '
        '"assets/js/react-dom.production.min.js"\n'
        "};\n"
        "</script>"
    )
    head_bits.append(f'<script src="{dc_runtime_path or "assets/js/dc-runtime.js"}"></script>')
    head_injection = "\n".join(head_bits) + "\n"

    t = t.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n',
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + head_injection,
        1,
    )

    t = re.sub(r"\n{3,}", "\n\n", t)

    # --- Validate ---
    leftover_uuids = [u for u in decoded if u in t]
    asset_refs = set(re.findall(r'["\'](assets/[^"\']+)["\']', t))
    missing = [r for r in asset_refs if not (site_dir / r.split("#")[0]).exists()]

    print("\n--- Validation ---")
    print("Leftover unresolved UUIDs:", leftover_uuids or "none")
    print(f"Asset references: {len(asset_refs)}, missing on disk: {missing or 'none'}")
    if skipped_dead_fonts:
        print(f"Font blobs skipped as dead (only used inside stripped @font-face rules): {len(skipped_dead_fonts)}")
    if missing:
        print(
            "\nNOTE: 'missing on disk' paths are worth a manual look, but are not\n"
            "always a real bug -- e.g. a `plate: 'assets/plates/name.png'` field\n"
            "has shown up in past exports as data that's assigned but never bound\n"
            "to any visible markup (confirmed by grepping for '{{ plate }}' and\n"
            "finding no match). This script writes the output anyway and trusts\n"
            "you to check the list below before publishing -- it does NOT block."
        )

    m = re.search(r'<script type="text/x-dc" data-dc-script="[^>]*>(.*?)</script>', t, re.DOTALL)
    if m:
        # Reader pages embed the full fable text + story data in this script
        # -- sometimes 10MB+. That's far past the OS argument-length limit,
        # so write it to a temp file and run node on the file rather than
        # passing it via `node -e "<huge string>"` (which fails with
        # "Argument list too long" on exactly the pages most worth checking).
        import tempfile
        js_check = "class DCLogic {}\n" + m.group(1) + "\nconsole.log('OK');"
        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False, encoding="utf-8") as tf:
                tf.write(js_check)
                tmp_js_path = tf.name
            proc = subprocess.run(
                ["node", tmp_js_path], capture_output=True, text=True, timeout=60,
            )
            print("Node syntax check:", proc.stdout.strip() or proc.stderr.strip())
        except FileNotFoundError:
            print("Node syntax check: SKIPPED (node not found on PATH)")
        finally:
            Path(tmp_js_path).unlink(missing_ok=True)

    print("\n--- Summary ---")
    print(build_report(reused, new_fonts, new_images, new_other, []))

    if leftover_uuids:
        print(
            "\n*** Not writing output: unresolved UUID references remain -- this "
            "means an asset type or fallback pattern this script doesn't know "
            "about yet. Add it to FALLBACK_PATH_FIXES or extend the asset-type "
            "handling, then re-run. ***"
        )
        sys.exit(1)

    if args.dry_run:
        print("\n--dry-run set: not writing output file or updated registry.")
        return

    out_page = site_dir / args.page
    out_page.write_text(t, encoding="utf-8")
    registry_path.write_text(json.dumps(registry, indent=1), encoding="utf-8")
    print(f"\nWrote {out_page}")
    print(f"Updated registry: {registry_path} ({len(registry)} total entries)")


if __name__ == "__main__":
    main()
