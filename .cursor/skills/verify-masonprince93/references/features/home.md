# Home profile

The live home page is PaperMod profile mode (`hugo.toml` `[params.profileMode] enabled = true`): name, subtitle, avatar, social icons, and three buttons. It is not a post list.

## Sub-features

- `profile-identity`: heading shows `Mason Prince`; subtitle mentions offensive security / CTF / vulnerability research.
- `profile-buttons`: `Blog`, `Projects`, `About` are visible and clickable.
- `social-icons`: Twitter, GitHub, LinkedIn, email icons in the profile (email is `mailto:` — inspect href, do not click).
- `header-present`: `header.header` / `ul#menu` render above the profile.

## How to get to it (user POV)

- Open https://masonprince93.com/ in a browser.
- Click the site logo / title in the header (PaperMod `accesskey="h"`).
- After visiting an inner page, choose the logo to return home.

## Driving it with control-masonprince93

Preconditions:

- `doctor` reports the live host `masonprince93.com` reachable (Cloudflare challenge on raw HTTP is OK).
- `launch` has opened Chrome on the live home page.

- **Direct landing.** `launch` already navigates to `/`. Run `info` or `snapshot`. Expect `page.hasProfile=true`, title containing `Mason Prince`, buttons `Blog`, `Projects`, `About`.
- **Recipe.** `drive --feature home` writes evidence under `evidence/<id>/` and asserts those buttons.
- **Logo return.** From `/about/`, `click --selector "header .logo a"` (or the visible site title). URL returns to `https://masonprince93.com/` and `.profile` is back.
- **Blog button.** `click --name Blog`. Lands on `/posts/` (see posts-and-archives). Return via logo before another home assertion.
- **Proof.** `screenshot` + `snapshot` with the profile name and the three buttons in the excerpt. Do not use `eval` to rewrite the heading.

## Gotchas

- `profileMode` hides the home post stream. A missing post list on `/` is correct.
- `hugo.toml` sets `defaultTheme = "dark"`, but Chrome may honor `prefers-color-scheme` and open light. Do not fail home because the first paint is light.
- The email social icon is `mailto:mason.a.prince@gmail.com`. The CLI refuses that click.
- Cloudflare may show an interstitial first. `wait --ready` until `.profile` or `ul#menu` exists; do not treat the challenge page as the home profile.
