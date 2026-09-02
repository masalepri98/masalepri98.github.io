# masonprince93.com feature map

Behavior-level inventory of the live Hugo + PaperMod site at https://masonprince93.com. Agents use this map to decide what to drive and what evidence counts. The live host is the source of truth. Cloudflare in front of GitHub Pages is expected.

This is a small public site. Five files cover the visitor-facing chrome. Do not invent extra products, dashboards, or backends.

## Baseline preconditions

- Run `control-masonprince93` `doctor` first. `ok=true` is required. A Cloudflare JS challenge on raw HTTP is fine; Chrome CDP is the lever.
- Launch isolated Chrome with `launch` (session under `/tmp/masonprince93-verify`, default CDP `9222`).
- Drive https://masonprince93.com — not GitHub Pages APIs, not PaperMod internals, not `eval` that assigns `location`.
- **Never mutate production.** Do not submit forms. Do not click `mailto:` (About contact, newsletter Subscribe/Unsubscribe).
- About employer / education strings come only from `/about/` (`content/about.md`). Do not invent roles, employers, or dates.
- Optional local `hugo server -D` is an extra check after `git submodule update --init`. Live still wins.
- Prefer `ul#menu` names, `.profile .buttons`, and `#theme-toggle` over coordinates.

## Proof and skip reporting

- Capture the click (or typed URL) **and** the resulting URL + visible text.
- UI proof is a snapshot JSON plus a PNG with the site title or header visible.
- When a path is unreachable (CF challenge never clears, missing theme submodule on local only), name the block and say whether it is network, browser, or local-preview-only.
- Newsletter subscribe is **skipped on purpose**: it is mailto, which would compose mail.

## Full sweep

Walk this list top to bottom for a broad regression. Finish on search (client-side Fuse, needs `index.json`).

## Features

- [Home profile](home.md): PaperMod `profileMode` landing, identity, Blog/Projects/About buttons, social icons.
- [About](about.md): Employer and education source of truth, certifications, contact (inspect only).
- [Posts and archives](posts-and-archives.md): `/posts/`, `/archives/`, categories, tags, a single post opened from the list.
- [Nav and theme](nav-and-theme.md): `ul#menu` destinations and `#theme-toggle` dark/light.
- [Search](search.md): `/search/` Fuse search box and results.

Related but not first-class drive targets: `/projects/` (links into posts), `/newsletter/` (mailto — do not click Subscribe). There is no BookBot surface in this repo; do not look for bootdev/bookbot paths.

## Entry contract

Every feature file uses the same four H2s:

1. `Sub-features`
2. `How to get to it (user POV)`
3. `Driving it with control-masonprince93`
4. `Gotchas`
