#!/usr/bin/env node
/**
 * JSON CLI that launches an isolated Chrome and drives the LIVE public site
 * https://masonprince93.com over CDP the way a visitor would.
 *
 * Read-only against production. Never mutate the live site. Never follow
 * mailto: as a verification action (that would compose mail).
 *
 *   node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --help
 *   node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run doctor
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  captureScreenshotPng,
  cdpVersion,
  connectPage,
  evaluate,
  navigate as cdpNavigate,
} from "./lib/cdp.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = __dirname;
const DEFAULT_BASE_URL = "https://masonprince93.com";
const DEFAULT_HOST = "masonprince93.com";
const DEFAULT_CDP_PORT = 9222;
const DEFAULT_SESSION_DIR = "/tmp/masonprince93-verify";
const DEFAULT_EVIDENCE_DIR = path.join(SKILL_ROOT, "evidence");
const LIVE_PATHS = {
  home: "/",
  about: "/about/",
  posts: "/posts/",
  archives: "/archives/",
  categories: "/categories/",
  tags: "/tags/",
  projects: "/projects/",
  newsletter: "/newsletter/",
  search: "/search/",
};

const ABOUT_FACTS = {
  employer: "MindPoint Group, A Tyto Athene Company",
  role: "Penetration Tester",
  dates: "Mar 2023–Present",
  ms: "M.S. Computer Science — AI/ML Specialization",
  bs: "B.S. Cybersecurity & Information Assurance",
  school: "Western Governors University",
};

const MUTATION_REFUSED =
  "Refused: verification is read-only against production. Do not submit forms, follow mailto:, or change live content.";

/**
 * @typedef {object} ParsedArgs
 * @property {string} command
 * @property {boolean} help
 * @property {boolean} dryRun
 * @property {boolean} pretty
 * @property {Record<string, string | boolean>} flags
 */

/**
 * @param {string[]} argv
 * @returns {ParsedArgs}
 */
function parseArgs(argv) {
  const flags = /** @type {Record<string, string | boolean>} */ ({});
  /** @type {string[]} */
  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      flags.help = true;
      continue;
    }
    if (token === "--dry-run") {
      flags.dryRun = true;
      continue;
    }
    if (token === "--pretty") {
      flags.pretty = true;
      continue;
    }
    if (token === "--json") {
      flags.json = true;
      continue;
    }
    if (token.startsWith("--") && token.includes("=")) {
      const eq = token.indexOf("=");
      flags[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }
    positionals.push(token);
  }
  return {
    command: positionals[0] || (flags.help ? "help" : ""),
    help: Boolean(flags.help),
    dryRun: Boolean(flags.dryRun),
    pretty: Boolean(flags.pretty),
    flags,
  };
}

function helpText() {
  return `control-masonprince93 — drive the live Hugo + PaperMod site over Chrome CDP

USAGE
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs <command> [flags]
  .cursor/skills/verify-masonprince93/control-masonprince93.mjs <command> [flags]

SOURCE OF TRUTH
  Live site: ${DEFAULT_BASE_URL}
  About facts (employer / education): ${DEFAULT_BASE_URL}/about/
  Isolation: NEVER mutate production. Do not follow mailto: or submit forms.

COMMANDS
  doctor       Read-only HTTP check that the live host is reachable and worth driving
  launch       Start isolated Chrome with remote debugging and open the live home page
  info         Report the current CDP session and visible page
  navigate     Open a same-origin path (user-typed URL bar)
  click        Click a visible link/button (preferred user path)
  press        Press a key (e.g. theme accesskey is Alt+T in PaperMod)
  wait         Wait for chrome ready, a CSS selector, or visible text
  snapshot     JSON of title, URL, nav, theme, and visible text
  screenshot   PNG of the current page
  eval         Read-only JS inspect after a user path (refuses mutation)
  drive        Run one mapped feature recipe (home|about|posts|nav|search)
  cleanup      Stop Chrome this run started. Does not delete evidence.

GLOBAL FLAGS
  --help              Print this help (also as JSON with command=help)
  --dry-run           Print the planned action as JSON; do not touch Chrome or the network
  --pretty            Pretty-print JSON on stdout
  --cdp <port>        Chrome remote-debugging port (default ${DEFAULT_CDP_PORT})
  --base-url <url>    Default ${DEFAULT_BASE_URL}
  --session-dir <dir> Default ${DEFAULT_SESSION_DIR}
  --evidence-dir <dir> Default ${DEFAULT_EVIDENCE_DIR}
  --headless          Force headless Chrome (default: headed if DISPLAY is set)
  --headed            Force headed Chrome

COMMAND FLAGS
  navigate --url <path-or-url>
  click    --selector <css> | --name <accessible-or-visible-name> | --text <substring>
  press    --key <Key>          e.g. Home, Enter, Alt+t
  wait     --ready | --selector <css> | --text <substring> | --ms <n>
  snapshot --path <file.json>
  screenshot --path <file.png>
  eval     --js <expression>
  drive    --feature <home|about|posts|nav|search> [--evidence-id <id>]

OUTPUT
  Every command prints one JSON object on stdout. Logs go to stderr.
  Exit 0 on ok=true, 1 on ok=false.

EXAMPLES
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --help
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs --dry-run doctor
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs doctor --pretty
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs launch
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs drive --feature about
  node .cursor/skills/verify-masonprince93/control-masonprince93.mjs cleanup
`;
}

/**
 * @param {unknown} value
 * @param {boolean} pretty
 */
function writeJson(value, pretty) {
  process.stdout.write(`${JSON.stringify(value, null, pretty ? 2 : 0)}\n`);
}

/**
 * @param {string} message
 */
function log(message) {
  process.stderr.write(`[control-masonprince93] ${message}\n`);
}

/**
 * @param {ParsedArgs} parsed
 */
function pathsFromFlags(parsed) {
  const baseUrl = String(parsed.flags["base-url"] || DEFAULT_BASE_URL).replace(/\/$/, "");
  const sessionDir = String(parsed.flags["session-dir"] || DEFAULT_SESSION_DIR);
  const evidenceDir = String(parsed.flags["evidence-dir"] || DEFAULT_EVIDENCE_DIR);
  const port = Number(parsed.flags.cdp || DEFAULT_CDP_PORT);
  return { baseUrl, sessionDir, evidenceDir, port };
}

function sessionFile(sessionDir) {
  return path.join(sessionDir, "session.json");
}

/**
 * @param {string} sessionDir
 * @returns {Promise<any | null>}
 */
async function readSession(sessionDir) {
  const file = sessionFile(sessionDir);
  if (!existsSync(file)) {
    return null;
  }
  return JSON.parse(await readFile(file, "utf8"));
}

/**
 * @param {string} sessionDir
 * @param {object} data
 */
async function writeSession(sessionDir, data) {
  await mkdir(sessionDir, { recursive: true });
  await writeFile(sessionFile(sessionDir), `${JSON.stringify(data, null, 2)}\n`);
}

function chromeBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return "google-chrome";
}

/**
 * @param {string} baseUrl
 * @param {string} urlOrPath
 * @returns {string}
 */
function resolveLiveUrl(baseUrl, urlOrPath) {
  if (!urlOrPath) {
    return `${baseUrl}/`;
  }
  if (/^https?:\/\//i.test(urlOrPath)) {
    const parsed = new URL(urlOrPath);
    if (parsed.hostname !== DEFAULT_HOST && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      throw new Error(`Refused off-site URL ${urlOrPath}. Stay on ${DEFAULT_HOST} or local Hugo.`);
    }
    return parsed.toString();
  }
  const prefix = urlOrPath.startsWith("/") ? "" : "/";
  return `${baseUrl}${prefix}${urlOrPath}`;
}

function isMailto(href) {
  return typeof href === "string" && href.trim().toLowerCase().startsWith("mailto:");
}

function looksLikeMutationJs(expression) {
  const src = String(expression || "");
  return (
    /\bmailto:/i.test(src) ||
    /\.submit\s*\(/.test(src) ||
    /document\.cookie\s*=/.test(src) ||
    /localStorage\.clear\s*\(/.test(src) ||
    /location\s*=/.test(src) ||
    /location\.assign\s*\(/.test(src) ||
    /location\.replace\s*\(/.test(src) ||
    /\bfetch\s*\(/.test(src) ||
    /XMLHttpRequest/.test(src) ||
    /navigator\.sendBeacon/.test(src)
  );
}

/**
 * @param {string} url
 */
async function probeHttp(url) {
  const started = Date.now();
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "masonprince93-verify/1.0 (read-only doctor; +https://masonprince93.com)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  const body = await response.text();
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const finalUrl = response.url || url;
  let host = "";
  try {
    host = new URL(finalUrl).hostname;
  } catch {
    host = "";
  }
  const server = String(headers.server || "");
  const challenge =
    response.status === 403 &&
    (String(headers["cf-mitigated"] || "").includes("challenge") || /just a moment|security verification/i.test(body));
  const htmlLooksLikeSite =
    /mason prince/i.test(body) && /papermod|theme-toggle|#menu|profile/i.test(body);
  return {
    url,
    finalUrl,
    host,
    status: response.status,
    okHttp: response.ok,
    elapsedMs: Date.now() - started,
    server,
    cloudflare: /cloudflare/i.test(server) || Boolean(headers["cf-ray"]),
    cfRay: headers["cf-ray"] || null,
    cfMitigated: headers["cf-mitigated"] || null,
    challenge,
    htmlLooksLikeSite,
    titleMatch: /<title>([^<]+)<\/title>/i.exec(body)?.[1] || null,
    bodyBytes: Buffer.byteLength(body),
  };
}

function doctorWorthDriving(home, about) {
  const hostOk = home.host === DEFAULT_HOST || home.finalUrl.includes(DEFAULT_HOST);
  const reachable = home.status > 0 && (home.okHttp || home.challenge || home.cloudflare);
  const aboutReachable =
    !about || about.status > 0 && (about.okHttp || about.challenge || about.cloudflare);
  return {
    ok: Boolean(hostOk && reachable && aboutReachable),
    hostOk,
    reachable,
    aboutReachable,
    reason: !hostOk
      ? `expected host ${DEFAULT_HOST}, got ${home.host || home.finalUrl}`
      : !reachable
        ? "home did not answer over HTTPS"
        : !aboutReachable
          ? "about did not answer over HTTPS"
          : home.challenge
            ? "reachable; Cloudflare JS challenge on raw HTTP — drive via CDP"
            : "reachable",
  };
}

async function cmdDoctor(parsed) {
  const { baseUrl, sessionDir, port } = pathsFromFlags(parsed);
  const plan = {
    action: "doctor",
    checks: [
      `GET ${baseUrl}/`,
      `GET ${baseUrl}/about/`,
      `expect host ${DEFAULT_HOST}`,
      "Cloudflare / GitHub Pages in front is accepted",
      "optional: existing CDP session",
    ],
  };
  if (parsed.dryRun) {
    return { ok: true, command: "doctor", dryRun: true, plan };
  }
  const home = await probeHttp(`${baseUrl}/`);
  const about = await probeHttp(`${baseUrl}/about/`);
  const verdict = doctorWorthDriving(home, about);
  let cdp = null;
  try {
    const version = await cdpVersion(port);
    cdp = { up: true, port, browser: version.Browser || null };
  } catch {
    cdp = { up: false, port };
  }
  const session = await readSession(sessionDir);
  return {
    ok: verdict.ok,
    command: "doctor",
    dryRun: false,
    liveSite: baseUrl,
    expectedHost: DEFAULT_HOST,
    verdict,
    home,
    about,
    cdp,
    session,
    isolation: {
      production: true,
      mutate: false,
      note: "Verification is read-only. Cloudflare in front of GitHub Pages is expected.",
    },
  };
}

function wantHeadless(parsed) {
  if (parsed.flags.headed) {
    return false;
  }
  if (parsed.flags.headless) {
    return true;
  }
  return !process.env.DISPLAY;
}

async function waitForCdp(port, timeoutMs = 20000) {
  const started = Date.now();
  let lastError = "not tried";
  while (Date.now() - started < timeoutMs) {
    try {
      return await cdpVersion(port);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error(`Chrome CDP did not come up on port ${port}: ${lastError}`);
}

async function cmdLaunch(parsed) {
  const { baseUrl, sessionDir, port } = pathsFromFlags(parsed);
  const userDataDir = path.join(sessionDir, "chrome-user-data");
  const headless = wantHeadless(parsed);
  const binary = chromeBinary();
  const home = `${baseUrl}/`;
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--window-size=1280,900",
    home,
  ];
  if (headless) {
    args.unshift("--headless=new");
  }
  const plan = { action: "launch", binary, args, userDataDir, port, url: home };
  if (parsed.dryRun) {
    return { ok: true, command: "launch", dryRun: true, plan };
  }
  await mkdir(userDataDir, { recursive: true });
  const child = spawn(binary, args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  const version = await waitForCdp(port);
  const session = {
    pid: child.pid,
    port,
    userDataDir,
    sessionDir,
    baseUrl,
    startedAt: new Date().toISOString(),
    headless,
    browser: version.Browser || null,
  };
  await writeSession(sessionDir, session);
  const page = await connectAndWaitReady(port, 45000);
  page.session.close();
  log(`Chrome pid=${child.pid} cdp=${port} opened ${home}`);
  return { ok: true, command: "launch", dryRun: false, session, ready: page.ready };
}

/**
 * @param {number} port
 * @param {number} timeoutMs
 */
async function connectAndWaitReady(port, timeoutMs = 45000) {
  const session = await connectPage(port);
  const started = Date.now();
  let last = { ready: false };
  while (Date.now() - started < timeoutMs) {
    last = await evaluate(session, PAGE_STATE_JS);
    if (last.ready) {
      return { session, ready: last };
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return { session, ready: last };
}

const PAGE_STATE_JS = `(() => {
  const challenge = /just a moment|security verification|enable javascript and cookies/i.test(document.title + " " + document.body?.innerText || "");
  const header = document.querySelector("header.header, nav.nav, ul#menu");
  const profile = document.querySelector("div.profile");
  const article = document.querySelector("article, .post-content, .page-header, #searchbox, .archive-posts, main");
  const theme = document.documentElement.classList.contains("dark") ? "dark"
    : document.documentElement.classList.contains("light") ? "light"
    : document.documentElement.getAttribute("data-theme") || (document.body.classList.contains("dark") ? "dark" : "unknown");
  const menu = [...document.querySelectorAll("ul#menu a")].map((a) => ({
    text: (a.textContent || "").trim(),
    href: a.href,
  }));
  const buttons = [...document.querySelectorAll(".profile .buttons a, .buttons a")].map((a) => ({
    text: (a.textContent || "").trim(),
    href: a.href,
  }));
  const text = (document.body?.innerText || "").replace(/\\s+/g, " ").trim();
  const ready = Boolean(!challenge && (header || profile || article) && text.length > 40);
  return {
    ready,
    challenge,
    url: location.href,
    title: document.title,
    theme,
    hasHeader: Boolean(header),
    hasProfile: Boolean(profile),
    hasThemeToggle: Boolean(document.querySelector("#theme-toggle")),
    menu,
    buttons,
    textExcerpt: text.slice(0, 4000),
    textLength: text.length,
  };
})()`;

async function withPage(parsed, fn) {
  const { port } = pathsFromFlags(parsed);
  const { session, ready } = await connectAndWaitReady(port);
  try {
    return await fn(session, ready);
  } finally {
    session.close();
  }
}

async function cmdInfo(parsed) {
  const { baseUrl, sessionDir, port } = pathsFromFlags(parsed);
  if (parsed.dryRun) {
    return { ok: true, command: "info", dryRun: true, plan: { action: "info", port, sessionDir } };
  }
  const stored = await readSession(sessionDir);
  try {
    const version = await cdpVersion(port);
    const page = await withPage(parsed, async (_session, ready) => ready);
    return {
      ok: Boolean(page.ready),
      command: "info",
      dryRun: false,
      liveSite: baseUrl,
      session: stored,
      browser: version.Browser,
      page,
    };
  } catch (error) {
    return {
      ok: false,
      command: "info",
      error: error instanceof Error ? error.message : String(error),
      session: stored,
    };
  }
}

async function cmdNavigate(parsed) {
  const { baseUrl, port } = pathsFromFlags(parsed);
  const target = resolveLiveUrl(baseUrl, String(parsed.flags.url || "/"));
  if (parsed.dryRun) {
    return { ok: true, command: "navigate", dryRun: true, plan: { action: "navigate", url: target, port } };
  }
  return withPage(parsed, async (session) => {
    await cdpNavigate(session, target);
    const after = await waitForReadyState(session);
    return {
      ok: Boolean(after.ready),
      command: "navigate",
      dryRun: false,
      action: { type: "navigate", url: target },
      page: after,
    };
  });
}

/**
 * @param {import("./lib/cdp.mjs").CdpSession} session
 * @param {number} [timeoutMs]
 */
async function waitForReadyState(session, timeoutMs = 30000) {
  const started = Date.now();
  let last = await evaluate(session, PAGE_STATE_JS);
  while (!last.ready && Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 300));
    last = await evaluate(session, PAGE_STATE_JS);
  }
  return last;
}

const CLICK_JS = (mode, value) => `(() => {
  const mode = ${JSON.stringify(mode)};
  const value = ${JSON.stringify(value)};
  const nodes = [...document.querySelectorAll("a, button, [role='button'], #theme-toggle")];
  function label(el) {
    return (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").replace(/\\s+/g, " ").trim();
  }
  let el = null;
  if (mode === "selector") {
    el = document.querySelector(value);
  } else if (mode === "name") {
    el = nodes.find((n) => label(n).toLowerCase() === value.toLowerCase()) || null;
  } else if (mode === "text") {
    el = nodes.find((n) => label(n).toLowerCase().includes(value.toLowerCase())) || null;
  }
  if (!el) {
    return { found: false, mode, value };
  }
  const href = el.href || el.getAttribute("href") || "";
  if (href && href.toLowerCase().startsWith("mailto:")) {
    return { found: true, refused: "mailto", href, text: label(el) };
  }
  el.scrollIntoView({ block: "center", inline: "center" });
  el.click();
  return {
    found: true,
    refused: null,
    tag: el.tagName,
    id: el.id || null,
    text: label(el),
    href,
  };
})()`;

async function cmdClick(parsed) {
  const selector = parsed.flags.selector ? String(parsed.flags.selector) : "";
  const name = parsed.flags.name ? String(parsed.flags.name) : "";
  const text = parsed.flags.text ? String(parsed.flags.text) : "";
  const mode = selector ? "selector" : name ? "name" : "text";
  const value = selector || name || text;
  if (!value) {
    return { ok: false, command: "click", error: "Provide --selector, --name, or --text" };
  }
  if (parsed.dryRun) {
    return { ok: true, command: "click", dryRun: true, plan: { action: "click", mode, value } };
  }
  return withPage(parsed, async (session, before) => {
    const clicked = await evaluate(session, CLICK_JS(mode, value));
    if (clicked.refused === "mailto") {
      return { ok: false, command: "click", error: MUTATION_REFUSED, clicked };
    }
    if (!clicked.found) {
      return { ok: false, command: "click", error: `No clickable control for ${mode}=${value}`, page: before };
    }
    await new Promise((r) => setTimeout(r, 400));
    const after = await waitForReadyState(session);
    return {
      ok: true,
      command: "click",
      dryRun: false,
      action: { type: "click", mode, value, clicked },
      page: after,
    };
  });
}

async function cmdPress(parsed) {
  const key = String(parsed.flags.key || "");
  if (!key) {
    return { ok: false, command: "press", error: "Provide --key" };
  }
  if (parsed.dryRun) {
    return { ok: true, command: "press", dryRun: true, plan: { action: "press", key } };
  }
  return withPage(parsed, async (session) => {
    const parts = key.split("+");
    const modifiers = { alt: false, ctrl: false, meta: false, shift: false };
    let main = parts[parts.length - 1];
    for (const part of parts.slice(0, -1)) {
      const lower = part.toLowerCase();
      if (lower === "alt") modifiers.alt = true;
      if (lower === "ctrl" || lower === "control") modifiers.ctrl = true;
      if (lower === "meta" || lower === "cmd") modifiers.meta = true;
      if (lower === "shift") modifiers.shift = true;
    }
    await session.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: main,
      modifiers:
        (modifiers.alt ? 1 : 0) +
        (modifiers.ctrl ? 2 : 0) +
        (modifiers.meta ? 4 : 0) +
        (modifiers.shift ? 8 : 0),
    });
    await session.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: main,
      modifiers:
        (modifiers.alt ? 1 : 0) +
        (modifiers.ctrl ? 2 : 0) +
        (modifiers.meta ? 4 : 0) +
        (modifiers.shift ? 8 : 0),
    });
    const after = await waitForReadyState(session, 8000);
    return { ok: true, command: "press", dryRun: false, action: { type: "press", key }, page: after };
  });
}

async function cmdWait(parsed) {
  const selector = parsed.flags.selector ? String(parsed.flags.selector) : "";
  const text = parsed.flags.text ? String(parsed.flags.text) : "";
  const ms = parsed.flags.ms ? Number(parsed.flags.ms) : 0;
  const ready = Boolean(parsed.flags.ready);
  if (parsed.dryRun) {
    return { ok: true, command: "wait", dryRun: true, plan: { action: "wait", selector, text, ms, ready } };
  }
  if (ms) {
    await new Promise((r) => setTimeout(r, ms));
    return { ok: true, command: "wait", sleptMs: ms };
  }
  return withPage(parsed, async (session) => {
    const timeoutMs = Number(parsed.flags.timeout || 30000);
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const page = await evaluate(session, PAGE_STATE_JS);
      const extras = await evaluate(
        session,
        `(() => {
          const selector = ${JSON.stringify(selector)};
          const needle = ${JSON.stringify(text)};
          const body = document.body?.innerText || "";
          return {
            hasSelector: selector ? Boolean(document.querySelector(selector)) : true,
            hasText: needle ? body.includes(needle) : true,
          };
        })()`,
      );
      const pageReady = ready ? Boolean(page.ready) : true;
      if (pageReady && extras.hasSelector && extras.hasText) {
        return { ok: true, command: "wait", page };
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return { ok: false, command: "wait", error: "wait timed out", selector, text, ready };
  });
}

async function writeEvidenceFile(filePath, contents, encoding = "utf8") {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, encoding);
}

async function cmdSnapshot(parsed) {
  const { evidenceDir } = pathsFromFlags(parsed);
  const out = parsed.flags.path
    ? String(parsed.flags.path)
    : path.join(evidenceDir, `snapshot-${stamp()}.json`);
  if (parsed.dryRun) {
    return { ok: true, command: "snapshot", dryRun: true, plan: { action: "snapshot", path: out } };
  }
  return withPage(parsed, async (session, ready) => {
    await writeEvidenceFile(out, `${JSON.stringify(ready, null, 2)}\n`);
    return { ok: Boolean(ready.ready), command: "snapshot", path: out, page: ready };
  });
}

async function cmdScreenshot(parsed) {
  const { evidenceDir } = pathsFromFlags(parsed);
  const out = parsed.flags.path
    ? String(parsed.flags.path)
    : path.join(evidenceDir, `screenshot-${stamp()}.png`);
  if (parsed.dryRun) {
    return { ok: true, command: "screenshot", dryRun: true, plan: { action: "screenshot", path: out } };
  }
  return withPage(parsed, async (session, ready) => {
    const png = await captureScreenshotPng(session);
    await writeEvidenceFile(out, png, undefined);
    return {
      ok: true,
      command: "screenshot",
      path: out,
      bytes: png.length,
      page: { url: ready.url, title: ready.title },
    };
  });
}

async function cmdEval(parsed) {
  const js = String(parsed.flags.js || "");
  if (!js) {
    return { ok: false, command: "eval", error: "Provide --js" };
  }
  if (looksLikeMutationJs(js)) {
    return { ok: false, command: "eval", error: MUTATION_REFUSED };
  }
  if (parsed.dryRun) {
    return { ok: true, command: "eval", dryRun: true, plan: { action: "eval", js } };
  }
  return withPage(parsed, async (session) => {
    const value = await evaluate(session, js);
    return { ok: true, command: "eval", value };
  });
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function cmdDrive(parsed) {
  const feature = String(parsed.flags.feature || "");
  const allowed = ["home", "about", "posts", "nav", "search"];
  if (!allowed.includes(feature)) {
    return {
      ok: false,
      command: "drive",
      error: `Unknown feature "${feature}". Use one of: ${allowed.join(", ")}`,
    };
  }
  const { baseUrl, evidenceDir, port } = pathsFromFlags(parsed);
  const evidenceId = String(parsed.flags["evidence-id"] || `${stamp()}-${feature}`);
  const dir = path.join(evidenceDir, evidenceId);
  const plan = {
    action: "drive",
    feature,
    baseUrl,
    evidenceDir: dir,
    steps: driveSteps(feature),
  };
  if (parsed.dryRun) {
    return { ok: true, command: "drive", dryRun: true, plan };
  }
  await mkdir(dir, { recursive: true });
  const session = await connectPage(port);
  /** @type {object[]} */
  const actions = [];
  try {
    const run = async (label, fn) => {
      const result = await fn();
      actions.push({ label, result });
      return result;
    };
    await run("goto-home", async () => {
      await cdpNavigate(session, `${baseUrl}/`);
      return waitForReadyState(session);
    });
    if (feature === "home") {
      const page = actions.at(-1)?.result;
      const facts = homeFacts(page);
      await capturePair(session, dir, "after-home", page);
      return finishDrive({ feature, dir, actions, ok: facts.ok, assertions: facts, page });
    }
    if (feature === "about") {
      const clicked = await run("click-about-nav", async () =>
        evaluate(session, CLICK_JS("name", "About")),
      );
      if (clicked.refused === "mailto") {
        return finishDrive({ feature, dir, actions, ok: false, error: MUTATION_REFUSED });
      }
      await new Promise((r) => setTimeout(r, 400));
      const page = await run("about-ready", () => waitForReadyState(session));
      const facts = aboutFacts(page);
      await capturePair(session, dir, "after-about-nav", page);
      await run("scroll-experience", async () =>
        evaluate(
          session,
          `(() => {
            const heading = document.getElementById("experience")
              || [...document.querySelectorAll("h1,h2,h3,h4")].find((h) => /experience/i.test(h.textContent || ""));
            if (heading) heading.scrollIntoView({ block: "start" });
            return { scrolled: Boolean(heading), id: heading?.id || null, text: heading?.textContent || null };
          })()`,
        ),
      );
      await new Promise((r) => setTimeout(r, 200));
      const scrolled = await evaluate(session, PAGE_STATE_JS);
      await capturePair(session, dir, "after-about-experience", scrolled);
      return finishDrive({ feature, dir, actions, ok: facts.ok, assertions: facts, page });
    }
    if (feature === "posts") {
      const clicked = await run("click-posts-nav", async () =>
        evaluate(session, CLICK_JS("name", "Posts")),
      );
      await new Promise((r) => setTimeout(r, 400));
      const page = await run("posts-ready", () => waitForReadyState(session));
      const facts = postsFacts(page);
      await capturePair(session, dir, "after-posts-nav", page);
      return finishDrive({ feature, dir, actions, ok: facts.ok, assertions: facts, page });
    }
    if (feature === "nav") {
      const before = await evaluate(session, PAGE_STATE_JS);
      const clicked = await run("click-theme-toggle", async () =>
        evaluate(session, CLICK_JS("selector", "#theme-toggle")),
      );
      await new Promise((r) => setTimeout(r, 300));
      const after = await run("theme-after", () => evaluate(session, PAGE_STATE_JS));
      await capturePair(session, dir, "after-theme-toggle", after);
      const ok = Boolean(clicked.found && before.theme && after.theme && before.theme !== after.theme);
      return finishDrive({
        feature,
        dir,
        actions,
        ok,
        assertions: { themeBefore: before.theme, themeAfter: after.theme, toggled: before.theme !== after.theme },
        page: after,
      });
    }
    if (feature === "search") {
      const clicked = await run("click-search-nav", async () =>
        evaluate(session, CLICK_JS("name", "Search")),
      );
      await new Promise((r) => setTimeout(r, 400));
      const page = await run("search-ready", () => waitForReadyState(session));
      const hasBox = await evaluate(
        session,
        `Boolean(document.querySelector("#searchInput, input#searchInput, form#search"))`,
      );
      await capturePair(session, dir, "after-search-nav", page);
      return finishDrive({
        feature,
        dir,
        actions,
        ok: Boolean(clicked.found && /\/search\/?/.test(page.url) && hasBox),
        assertions: { url: page.url, hasSearchInput: hasBox },
        page,
      });
    }
    return finishDrive({ feature, dir, actions, ok: false, error: "unreachable" });
  } finally {
    session.close();
  }
}

function driveSteps(feature) {
  const shared = ["navigate https://masonprince93.com/"];
  if (feature === "home") {
    return [...shared, "assert profile title + Blog/Projects/About buttons", "snapshot + screenshot"];
  }
  if (feature === "about") {
    return [
      ...shared,
      "click nav name=About (not a mailto)",
      "assert MindPoint Group + WGU education from visible text",
      "snapshot + screenshot",
    ];
  }
  if (feature === "posts") {
    return [...shared, "click nav name=Posts", "assert a post list on /posts/", "snapshot + screenshot"];
  }
  if (feature === "nav") {
    return [...shared, "click #theme-toggle", "assert html theme class changed", "snapshot + screenshot"];
  }
  return [...shared, "click nav name=Search", "assert #searchInput on /search/", "snapshot + screenshot"];
}

function homeFacts(page) {
  const text = page?.textExcerpt || "";
  const names = (page?.buttons || []).map((b) => b.text);
  const hasName = /mason prince/i.test(page?.title || "") || /mason prince/i.test(text);
  const hasButtons = ["Blog", "Projects", "About"].every((n) => names.includes(n));
  return { ok: Boolean(page?.ready && hasName && hasButtons), hasName, hasButtons, buttons: names };
}

function aboutFacts(page) {
  const text = page?.textExcerpt || "";
  const urlOk = /\/about\/?/.test(page?.url || "");
  const employer = text.includes(ABOUT_FACTS.employer);
  const role = text.includes(ABOUT_FACTS.role);
  const school = text.includes(ABOUT_FACTS.school);
  const ms = text.includes("M.S. Computer Science") || text.includes(ABOUT_FACTS.ms);
  const bs = text.includes("B.S. Cybersecurity") || text.includes(ABOUT_FACTS.bs);
  return {
    ok: Boolean(page?.ready && urlOk && employer && role && school && ms && bs),
    urlOk,
    employer,
    role,
    school,
    ms,
    bs,
    sourceOfTruth: `${DEFAULT_BASE_URL}/about/`,
    expected: ABOUT_FACTS,
  };
}

function postsFacts(page) {
  const urlOk = /\/posts\/?/.test(page?.url || "");
  const text = page?.textExcerpt || "";
  const hasList = /oswe|hackthebox|log4shell|wordlist|mcp|agent fleet/i.test(text);
  return { ok: Boolean(page?.ready && urlOk && hasList), urlOk, hasList };
}

/**
 * @param {import("./lib/cdp.mjs").CdpSession} session
 * @param {string} dir
 * @param {string} label
 * @param {any} page
 */
async function capturePair(session, dir, label, page) {
  const snapPath = path.join(dir, `${label}.snapshot.json`);
  const shotPath = path.join(dir, `${label}.png`);
  await writeEvidenceFile(snapPath, `${JSON.stringify(page, null, 2)}\n`);
  const png = await captureScreenshotPng(session);
  await writeEvidenceFile(shotPath, png, undefined);
  return { snapshot: snapPath, screenshot: shotPath, bytes: png.length };
}

function finishDrive({ feature, dir, actions, ok, assertions, page, error }) {
  const summary = {
    ok,
    command: "drive",
    feature,
    evidenceDir: dir,
    assertions: assertions || null,
    error: error || null,
    actionCount: actions.length,
    page: page
      ? { url: page.url, title: page.title, ready: page.ready, theme: page.theme }
      : null,
    actions: actions.map((a) => ({
      label: a.label,
      url: a.result?.url,
      title: a.result?.title,
      found: a.result?.found,
      text: a.result?.text,
    })),
  };
  const summaryPath = path.join(dir, "summary.json");
  return writeEvidenceFile(summaryPath, `${JSON.stringify({ ...summary, actions }, null, 2)}\n`).then(
    () => ({ ...summary, summaryPath }),
  );
}

async function cmdCleanup(parsed) {
  const { sessionDir } = pathsFromFlags(parsed);
  const stored = await readSession(sessionDir);
  if (parsed.dryRun) {
    return {
      ok: true,
      command: "cleanup",
      dryRun: true,
      plan: {
        action: "cleanup",
        killPid: stored?.pid || null,
        removeUserData: stored?.userDataDir || path.join(sessionDir, "chrome-user-data"),
        keepEvidence: true,
      },
    };
  }
  if (!stored?.pid) {
    return {
      ok: true,
      command: "cleanup",
      note: "No session file; nothing to kill. Evidence was not touched.",
      session: stored,
    };
  }
  try {
    process.kill(stored.pid, 0);
    process.kill(stored.pid, "SIGTERM");
  } catch {
    // already gone
  }
  await new Promise((r) => setTimeout(r, 400));
  try {
    process.kill(stored.pid, 0);
    process.kill(stored.pid, "SIGKILL");
  } catch {
    // gone
  }
  if (stored.userDataDir && stored.userDataDir.startsWith("/tmp/masonprince93-verify")) {
    await rm(stored.userDataDir, { recursive: true, force: true });
  }
  await rm(sessionFile(sessionDir), { force: true });
  return {
    ok: true,
    command: "cleanup",
    killedPid: stored.pid,
    removedUserData: stored.userDataDir,
    evidencePreserved: true,
    note: "Cleanup never deletes .cursor/skills/verify-masonprince93/evidence/",
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help || parsed.command === "help" || parsed.command === "") {
    if (parsed.flags.json || parsed.command === "help" && !parsed.help && parsed.command) {
      writeJson({ ok: true, command: "help", usage: helpText() }, parsed.pretty || true);
      process.exit(0);
    }
    process.stdout.write(helpText());
    process.exit(0);
  }
  /** @type {Record<string, (p: ParsedArgs) => Promise<any>>} */
  const commands = {
    doctor: cmdDoctor,
    launch: cmdLaunch,
    info: cmdInfo,
    navigate: cmdNavigate,
    click: cmdClick,
    press: cmdPress,
    wait: cmdWait,
    snapshot: cmdSnapshot,
    screenshot: cmdScreenshot,
    eval: cmdEval,
    drive: cmdDrive,
    cleanup: cmdCleanup,
  };
  const fn = commands[parsed.command];
  if (!fn) {
    writeJson(
      { ok: false, command: parsed.command, error: `Unknown command "${parsed.command}"`, hint: "Pass --help" },
      parsed.pretty,
    );
    process.exit(1);
  }
  try {
    const result = await fn(parsed);
    writeJson({ ...result, dryRun: parsed.dryRun || Boolean(result.dryRun) }, parsed.pretty);
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    writeJson(
      {
        ok: false,
        command: parsed.command,
        error: error instanceof Error ? error.message : String(error),
      },
      parsed.pretty,
    );
    process.exit(1);
  }
}

main();
