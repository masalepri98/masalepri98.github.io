# Evidence

This directory holds verification proofs for the live site.

`control-masonprince93.mjs drive` and `screenshot` / `snapshot` write here by default:

```text
evidence/<timestamp>-<feature>/
  after-*.snapshot.json
  after-*.png
  summary.json
```

Cleanup stops Chrome and removes `/tmp/masonprince93-verify` session state. It never deletes these files.

Do not commit PNG/JSON run artifacts; they go stale when the live site changes. The directory itself stays in git so agents know where proofs belong.
