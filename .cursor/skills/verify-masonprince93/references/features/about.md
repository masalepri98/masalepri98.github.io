# About (employer and education)

`/about/` is the **source of truth** for employer, role, dates, and education. Drive the live page. Do not invent other employers, roles, or graduation dates. Repo file: `content/about.md`.

## Sub-features

- `about-route`: URL is `https://masonprince93.com/about/`.
- `experience`: visible text includes `Penetration Tester` at `MindPoint Group, A Tyto Athene Company` (`Mar 2023–Present`).
- `education-ms`: `M.S. Computer Science — AI/ML Specialization`, `Western Governors University`, `Jul 2026 (completed)`.
- `education-bs`: `B.S. Cybersecurity & Information Assurance`, `Western Governors University`, `Jan 2025`.
- `certifications`: OffSec OSWE / OSCP+ / OSEP lines are visible (optional extra, not a substitute for employer/edu).
- `contact-inspect`: email/Twitter/GitHub/LinkedIn are listed. Do not click mailto.

## How to get to it (user POV)

- Header: choose `About` in `ul#menu`.
- Home profile: choose the `About` button.
- Type https://masonprince93.com/about/ in the URL bar.

## Driving it with control-masonprince93

Preconditions:

- Live site passed `doctor`.
- Chrome is up via `launch`.
- Start from home so the nav click is the user path.

- **Nav entry (preferred).** From `/`, `click --name About`. URL becomes `/about/`. Visible text includes `MindPoint Group, A Tyto Athene Company` and `Western Governors University`.
- **Recipe.** `drive --feature about` does home → click About → assert role, employer, both degrees, school.
- **Profile button.** From `/`, `click --name About` also matches the profile button if the menu name is the same; if both exist, either is a valid About entry. Confirm URL `/about/`.
- **Typed URL (secondary).** `navigate --url /about/` proves the route exists. Do not use this as the only proof when the change was “About link in the header”.
- **Proof.** Snapshot excerpt must contain the employer string and both degree names exactly enough to match `content/about.md`. The first screenshot is the About chrome after the nav click (above the fold). Scroll to `#experience` and capture a second PNG so MindPoint Group and the WGU lines are visible. Record the click in `summary.json`.

Expected strings (copy from the live page / `content/about.md`, do not paraphrase):

- `Penetration Tester`
- `MindPoint Group, A Tyto Athene Company`
- `Mar 2023–Present`
- `M.S. Computer Science — AI/ML Specialization`
- `B.S. Cybersecurity & Information Assurance`
- `Western Governors University`

## Gotchas

- README and older posts may describe the site or a degree as in-progress. **About wins.** The M.S. line on About is `Jul 2026 (completed)` (see merged PR #13 / #12 on `master`).
- Do not add a second employer. The About page lists one Experience bullet.
- Contact email is `mailto:`. Inspect with `eval --js "document.querySelector('a[href^=mailto]').href"` after the page is open; do not `click` it.
- En-dash in `Mar 2023–Present` may appear as `–` or `&ndash;`. Assert a stable substring (`Mar 2023` and `Present`) if the exact glyph differs in `innerText`.
