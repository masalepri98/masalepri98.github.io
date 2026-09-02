# Search

PaperMod Fuse search at `/search/` (`content/search.md`, layout `search`). The index is the home JSON output (`[outputs] home = ["HTML", "RSS", "JSON"]` → `/index.json`).

## Sub-features

- `search-route`: `/search/` shows a search field (`#searchInput`).
- `search-match`: typing a known post token (e.g. `OSWE` or `Log4Shell`) lists matching titles.
- `search-empty`: a nonsense token shows no useful hits (empty list or “no results” UI).
- `search-open-result`: choosing a hit opens that post.

## How to get to it (user POV)

- Header `Search` (`ul#menu`, accesskey `/` on the Search item in PaperMod).
- Type https://masonprince93.com/search/.

## Driving it with control-masonprince93

Preconditions:

- `doctor` + `launch`.
- Start at `/`.

- **Open.** `click --name Search`. URL `/search/`. `wait --selector "#searchInput"`.
- **Recipe.** `drive --feature search` asserts the route and the input.
- **Match.** After the input exists, use `eval` only to **read** the field; to type, prefer CDP `Input` via `press` sequences or a future fill helper. Until a fill command exists, type with focused `#searchInput` and `press` for characters, or document a skip if key-by-key is too brittle — then still prove the empty box + route. A match proof: visible result list contains `OSWE` after the query, snapshot + screenshot.
- **Empty.** Query `zzzxnotapostonthissite`. Results do not show a real post title.
- **Proof.** Screenshot of `/search/` with the input visible. If results are proven, a second screenshot with `OSWE` in the list. Do not POST anywhere; this search is client-side.

## Gotchas

- Search needs `/index.json`. A 404 on that file means empty results even when posts exist. Check the JSON URL in the same Chrome session before calling search “broken”.
- Fuse is debounced. Wait for the result list, not a fixed short sleep.
- Do not treat `navigate --url /search/` as a substitute when the change was “Search link in the header”.
- This is not server search. There is no query string contract to assert unless the live page adds one.
