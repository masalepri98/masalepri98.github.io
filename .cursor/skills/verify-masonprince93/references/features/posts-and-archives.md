# Posts and archives

The writing index is `/posts/`. Archives, categories, and tags are PaperMod taxonomy/list pages. Individual posts use `permalinks.posts = "/:title/"` in `hugo.toml` (urlized title, not necessarily the `slug:` front matter).

## Sub-features

- `posts-index`: `/posts/` lists published posts from `content/posts/`.
- `open-post`: choosing a listed title opens that post’s permalink (not a 404).
- `archives`: `/archives/` (`content/archives.md`, layout `archives`) lists posts by date.
- `categories`: `/categories/` from `menu.main` and `[taxonomies]`.
- `tags`: `/tags/` from `menu.main`.

## How to get to it (user POV)

- Header `Posts`, or home profile button `Blog`.
- Header `Categories` or `Tags`.
- There is no Archives item in `menu.main`. A visitor reaches archives by typing `/archives/` or following an in-page link if present.
- From a list, choose a post title.

Published post files (open from the live list; do not hard-code a guessed slug as the only path):

- `content/posts/personal-agent-fleet-week.md`
- `content/posts/oswe-exam-review-passed.md`
- `content/posts/oswe-exam-prep-journey.md`
- `content/posts/mscsaiml-halfway-through.md`
- `content/posts/mcp-security.md`
- `content/posts/log4shell-deep-dive.md`
- `content/posts/htb-precious-walkthrough.md`
- `content/posts/building-custom-wordlists.md`

## Driving it with control-masonprince93

Preconditions:

- `doctor` + `launch`.
- Start at `/` so the Posts click is real navigation.

- **Index.** `click --name Posts`. URL is `/posts/`. Snapshot text includes at least one real title (OSWE, MCP, Log4Shell, Precious, wordlists, or agent fleet).
- **Recipe.** `drive --feature posts`.
- **Open one post.** On `/posts/`, `click --text "OSWE Exam Review"` (or another listed title). URL leaves `/posts/` and the article heading matches the link. This is the permalink proof — do not construct `/oswe-exam-review-passed-tips-and-experience/` unless the live list uses that href.
- **Archives.** `navigate --url /archives/`. Expect a dated list, not a 404.
- **Categories / tags.** `click --name Categories` then `click --name Tags`. Each lands on its taxonomy root.
- **Proof.** Screenshot of `/posts/` with more than one title visible, plus a second screenshot after opening one post. Snapshot records both URLs.

## Gotchas

- Permalinks are `/:title/`. Front-matter `slug:` can disagree with the live href. **Click the live list.** `content/projects/_index.md` has at least one handwritten link that may not match `/:title/` (AI/ML slash in a path). Treat a 404 on a handwritten projects link as a projects-page bug, not as “posts are down”, if `/posts/` still lists the article.
- `buildDrafts = false`. Drafts in content will not appear live.
- Archives is not in the main menu. `navigate --url /archives/` is the user-typed-URL path; do not fail the Posts feature solely because Archives is missing from `ul#menu`.
- Do not open BookBot or bootdev URLs. They are not routes in this site.
