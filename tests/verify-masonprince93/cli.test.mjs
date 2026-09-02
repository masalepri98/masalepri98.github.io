import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(root, ".cursor/skills/verify-masonprince93/control-masonprince93.mjs");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

test("bare --help prints usage and mentions --dry-run", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /control-masonprince93/);
  assert.match(result.stdout, /--dry-run/);
  assert.match(result.stdout, /doctor/);
  assert.match(result.stdout, /masonprince93\.com/);
});

test("--help --json emits JSON usage", () => {
  const result = run(["--help", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(body.command, "help");
  assert.match(body.usage, /--dry-run/);
});

test("--dry-run doctor prints a plan and does not require the network", () => {
  const result = run(["--dry-run", "doctor", "--pretty"]);
  assert.equal(result.status, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(body.dryRun, true);
  assert.equal(body.command, "doctor");
  assert.ok(Array.isArray(body.plan.checks));
  assert.ok(body.plan.checks.some((c) => String(c).includes("masonprince93.com")));
});

test("--dry-run drive --feature about lists the About click", () => {
  const result = run(["--dry-run", "drive", "--feature", "about"]);
  assert.equal(result.status, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(body.plan.feature, "about");
  assert.ok(body.plan.steps.some((s) => /About/i.test(s)));
});

test("unknown command returns JSON ok=false", () => {
  const result = run(["not-a-command"]);
  assert.equal(result.status, 1);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, false);
  assert.match(body.error, /Unknown command/);
});
