---
name: verify-masonprince93
description: "Drive the live masonprince93.com Hugo + PaperMod site (Cloudflare in front of GitHub Pages) via Chrome CDP. Use to prove public pages, About employer/education facts, posts/archives, nav, and theme — read-only, never mutate production."
---

# Verify masonprince93.com

Drive the **live** public site at [https://masonprince93.com](https://masonprince93.com) over Chrome CDP the way a visitor does: follow the header, click visible links, read on-page text. This is a Hugo + PaperMod static site. Cloudflare sits in front of GitHub Pages. The live host is the source of truth — not a local `hugo server` and not GitHub Pages APIs.

About facts (employer, role, dates, education) come only from [https://masonprince93.com/about/](https://masonprince93.com/about/) / `content/about.md`. Do not invent roles, employers, or dates.

The JSON CLI is:

```bash
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --help
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run doctor
.cursor/skills/verify-masonprince93/control-masonprince93.mjs doctor --pretty
```

The script is executable. Every command prints one JSON object on stdout (except bare `--help`, which prints usage text; add `--json` for JSON help).

## Interview (this repo)

- **Surface:** public website. Routes from `hugo.toml` + `content/`: `/` (PaperMod profileMode), `/posts/`, `/categories/`, `/tags/`, `/projects/`, `/about/`, `/newsletter/`, `/search/`, `/archives/`. Individual posts use `permalinks.posts = "/:title/"`.
- **Run:** verification launches Chrome pointed at the live host. Optional extra check: `hugo server -D` → `http://localhost:1313/` after `git submodule update --init` (theme path `themes/PaperMod` is a submodule and is empty until initialized). Live site still wins if they disagree.
- **Drive:** `control-masonprince93.mjs` (Chrome `--remote-debugging-port` + CDP). Click visible `ul#menu` links, profile `.buttons`, and `#theme-toggle`. Do not prove pages by assigning `location` or calling internal Hugo/PaperMod helpers.
- **Observe:** HTTP doctor probe, DOM snapshot JSON, PNG screenshots, visible text assertions. Evidence lives under `.cursor/skills/verify-masonprince93/evidence/` and survives cleanup.
- **Isolate:** this is production. **Never mutate the live site.** Do not submit forms. Do not follow `mailto:` (newsletter subscribe/unsubscribe and About contact). The CLI refuses those clicks. Two Chrome sessions: use `--cdp` + `--session-dir` so ports and user-data-dirs do not collide.

## Launch

Launch means: start an isolated Chrome that opens the live home page. There is no app server to boot for the source-of-truth path.

```bash
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs launch
# ready when JSON ok=true and page.ready=true (PaperMod header/profile present, not a CF interstitial)
```

- Default CDP port: `9222`. User data dir: `/tmp/masonprince93-verify/chrome-user-data`. Session file: `/tmp/masonprince93-verify/session.json`.
- Headless when `DISPLAY` is unset; pass `--headed` or `--headless` to force.
- Teardown is `cleanup` (below). Kill only the pid recorded in the session file.

Optional local preview (not the source of truth):

```bash
git submodule update --init
hugo server -D
# then: ... navigate --url http://127.0.0.1:1313/ --base-url http://127.0.0.1:1313
```

## Doctor

Read-only. Does **not** require Chrome. Answers: is https://masonprince93.com reachable and worth driving?

```bash
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs doctor --pretty
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run doctor
```

Checks:

1. `GET https://masonprince93.com/` and `GET https://masonprince93.com/about/`
2. Final host is `masonprince93.com`
3. Cloudflare (`server: cloudflare`, `cf-ray`) is accepted. A `403` with `cf-mitigated: challenge` is still reachable — raw HTTP is challenged; CDP with a real Chrome is the lever
4. Optionally reports whether a CDP port is already up

`ok=true` means drive it. `ok=false` means do not treat screenshots as proof.

## Drive

Prefer user-visible controls. Stable handles on this PaperMod skin:

| Control | Handle |
| --- | --- |
| Header menu | `ul#menu a` — names `Posts`, `Categories`, `Tags`, `Projects`, `About`, `Newsletter`, `Search` |
| Home profile buttons | `.profile .buttons a` — `Blog` → posts, `Projects`, `About` |
| Theme toggle | `#theme-toggle` (`accesskey="t"`). Default theme is dark (`hugo.toml` `defaultTheme = "dark"`) |
| Search field | `#searchInput` on `/search/` |
| About body | visible text in the article; assert employer/education strings from `/about/` only |

```bash
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs navigate --url /about/
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs click --name About
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs click --selector "#theme-toggle"
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs snapshot --path .cursor/skills/verify-masonprince93/evidence/demo.snapshot.json
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs screenshot --path .cursor/skills/verify-masonprince93/evidence/demo.png
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs eval --js "document.title"
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs drive --feature about
```

`eval` is for reading state after the user path. The CLI refuses `location=`, `fetch(`, form `submit`, `mailto:`, and cookie writes.

Mapped recipes (one command each): `drive --feature home|about|posts|nav|search`.

Read the matching file under [`references/features/`](references/features/) before driving. Open one feature file, not the whole map.

## Evidence

Proof artifacts go to `.cursor/skills/verify-masonprince93/evidence/<timestamp>-<feature>/` unless `--evidence-dir` / `--path` override.

A proof is:

1. The **action** (click About in `ul#menu`, not `location.href = "/about/"` as the primary path)
2. The **resulting state** (URL `/about/`, visible employer + education text, screenshot + snapshot)

Minimum files for a feature drive:

- `after-*.snapshot.json` — title, url, theme, menu, visible text excerpt
- `after-*.png` — what the visitor saw
- `summary.json` — actions + assertions

About assertions must include the live strings (do not paraphrase into a different employer):

- Role: `Penetration Tester`
- Employer: `MindPoint Group, A Tyto Athene Company`
- Dates: `Mar 2023–Present`
- Education: `M.S. Computer Science — AI/ML Specialization`, `Western Governors University`, `Jul 2026 (completed)`
- Education: `B.S. Cybersecurity & Information Assurance`, `Western Governors University`, `Jan 2025`

Newsletter `/newsletter/` is visible but **not** a drive target for subscribe: those controls are `mailto:mason-ceo@agentmail.to`. Inspect the page; do not click Subscribe.

## Cleanup

```bash
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs cleanup
node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run cleanup
```

Sends SIGTERM (then SIGKILL) to the **session pid only**. Removes `/tmp/masonprince93-verify/chrome-user-data` and the session file. **Does not delete evidence.** After cleanup, `evidence/` must still be on disk.

## Helpers

| Helper | Invocation |
| --- | --- |
| JSON control CLI | `node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --help` |
| Dry-run | `node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run doctor` |
| CDP client (library) | imported by the CLI from `lib/cdp.mjs` — not invoked directly |

CLI commands: `doctor`, `launch`, `info`, `navigate`, `click`, `press`, `wait`, `snapshot`, `screenshot`, `eval`, `drive`, `cleanup`. Global flags: `--help`, `--dry-run`, `--pretty`, `--json`, `--cdp`, `--base-url`, `--session-dir`, `--evidence-dir`, `--headless`, `--headed`.

## Feature map

Behavior inventory: [`references/features/`](references/features/). Each file uses four H2s: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-masonprince93`, `Gotchas`.

Keep the map current with `/maintain-verification-skill` when routes or About facts change.
