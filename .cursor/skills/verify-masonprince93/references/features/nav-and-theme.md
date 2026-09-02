# Nav and theme

Persistent PaperMod chrome: the header menu from `[[menu.main]]` in `hugo.toml`, and the theme toggle (`disableThemeToggle = false`, `defaultTheme = "dark"`).

## Sub-features

- `menu-items`: `ul#menu` shows Posts, Categories, Tags, Projects, About, Newsletter, Search in that weight order.
- `menu-destinations`: each item opens the matching path (`/posts/`, `/categories/`, `/tags/`, `/projects/`, `/about/`, `/newsletter/`, `/search/`).
- `theme-toggle`: `#theme-toggle` flips dark ↔ light on `document.documentElement` (PaperMod `dark` class).
- `theme-persists`: reload after toggle keeps the chosen theme (localStorage `pref-theme` in PaperMod).

## How to get to it (user POV)

- The header is on every page. Use the named menu links.
- Theme control is the sun/moon button next to the logo (`#theme-toggle`, accesskey `t` / Alt+T).
- Narrow viewports may collapse the menu behind PaperMod’s hamburger; open it if `#menu` links are not visible.

## Driving it with control-masonprince93

Preconditions:

- `doctor` + `launch` on `/`.
- A fresh user-data-dir often follows `hugo.toml` `defaultTheme = "dark"`, but Chrome may apply `prefers-color-scheme` and open in light. Assert a **change** on toggle, not a specific starting theme.

- **Menu presence.** `snapshot` → `page.menu` lists the seven names above.
- **One destination.** `click --name Projects` → URL `/projects/`. Return home via logo if the next step needs `/`.
- **Theme click.** Record `page.theme` (`info` or `eval --js "document.documentElement.className"`). `click --selector "#theme-toggle"`. Theme string changes (`dark` → not dark, or the reverse).
- **Recipe.** `drive --feature nav` clicks `#theme-toggle` and asserts the theme class changed.
- **Reload persistence.** After toggle, `navigate --url /` (same Chrome profile). Theme stays on the post-toggle value. A new `launch` (new user-data-dir) resets to dark.
- **Proof.** Snapshot before and after toggle in the same evidence dir, plus a PNG where the page background clearly changed. `summary.json` must include both theme values.

## Gotchas

- Do not set the theme by writing `className` or `localStorage` in `eval` as the primary proof. Click `#theme-toggle`.
- Newsletter is a real menu item. Opening `/newsletter/` to read the page is OK. Clicking Subscribe is not (mailto).
- Two About/Posts entry points exist (menu vs profile buttons). Either is valid; say which you clicked.
- Headless Chrome can still toggle the class even if the PNG looks flat. Believe the class + `pref-theme`, and still keep the screenshot.
