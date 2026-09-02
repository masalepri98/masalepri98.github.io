/**
 * Minimal Chrome DevTools Protocol client using Node's built-in WebSocket.
 * No npm dependencies. Talks to a Chrome started with --remote-debugging-port.
 */

const DEFAULT_HOST = "127.0.0.1";

/**
 * @typedef {object} CdpTarget
 * @property {string} id
 * @property {string} type
 * @property {string} url
 * @property {string} title
 * @property {string} webSocketDebuggerUrl
 */

/**
 * @param {number} port
 * @param {string} path
 * @returns {Promise<unknown>}
 */
export async function cdpHttp(port, path) {
  const url = `http://${DEFAULT_HOST}:${port}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CDP HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

/**
 * @param {number} port
 * @returns {Promise<{Browser: string, webSocketDebuggerUrl?: string}>}
 */
export async function cdpVersion(port) {
  return /** @type {any} */ (await cdpHttp(port, "/json/version"));
}

/**
 * @param {number} port
 * @returns {Promise<CdpTarget[]>}
 */
export async function cdpTargets(port) {
  return /** @type {CdpTarget[]} */ (await cdpHttp(port, "/json/list"));
}

/**
 * Pick the first page target, or create one if Chrome only has a browser target.
 *
 * @param {number} port
 * @returns {Promise<CdpTarget>}
 */
export async function firstPageTarget(port) {
  const targets = await cdpTargets(port);
  const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (page) {
    return page;
  }
  const created = /** @type {CdpTarget} */ (await cdpHttp(port, "/json/new?about:blank"));
  if (!created?.webSocketDebuggerUrl) {
    throw new Error("Chrome CDP has no page target");
  }
  return created;
}

export class CdpSession {
  /**
   * @param {string} webSocketDebuggerUrl
   */
  constructor(webSocketDebuggerUrl) {
    this.url = webSocketDebuggerUrl;
    /** @type {WebSocket | null} */
    this.ws = null;
    this.nextId = 1;
    /** @type {Map<number, {resolve: (v: any) => void, reject: (e: Error) => void}>} */
    this.pending = new Map();
    /** @type {Map<string, Array<(params: any) => void>>} */
    this.events = new Map();
  }

  /**
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id != null && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          reject(new Error(message.error.message || JSON.stringify(message.error)));
        } else {
          resolve(message.result);
        }
        return;
      }
      if (message.method) {
        const handlers = this.events.get(message.method) || [];
        for (const handler of handlers) {
          handler(message.params);
        }
      }
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve(undefined), { once: true });
      this.ws.addEventListener("error", () => reject(new Error(`CDP websocket failed: ${this.url}`)), {
        once: true,
      });
    });
  }

  /**
   * @param {string} method
   * @param {(params: any) => void} handler
   */
  on(method, handler) {
    const list = this.events.get(method) || [];
    list.push(handler);
    this.events.set(method, list);
  }

  /**
   * @param {string} method
   * @param {Record<string, unknown>} [params]
   * @returns {Promise<any>}
   */
  send(method, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("CDP session is not connected"));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    for (const { reject } of this.pending.values()) {
      reject(new Error("CDP session closed"));
    }
    this.pending.clear();
  }
}

/**
 * @param {number} port
 * @returns {Promise<CdpSession>}
 */
export async function connectPage(port) {
  const target = await firstPageTarget(port);
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.connect();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("DOM.enable");
  return session;
}

/**
 * Evaluate a JS expression in the page and return the JSON-serializable value.
 *
 * @param {CdpSession} session
 * @param {string} expression
 * @returns {Promise<any>}
 */
export async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    const text =
      result.exceptionDetails.exception?.description ||
      result.exceptionDetails.text ||
      "Runtime.evaluate failed";
    throw new Error(text);
  }
  return result.result?.value;
}

/**
 * @param {CdpSession} session
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<void>}
 */
export async function navigate(session, url, timeoutMs = 45000) {
  const loaded = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out navigating to ${url}`)), timeoutMs);
    session.on("Page.loadEventFired", () => {
      clearTimeout(timer);
      resolve(undefined);
    });
  });
  await session.send("Page.navigate", { url });
  await loaded;
}

/**
 * @param {CdpSession} session
 * @returns {Promise<Buffer>}
 */
export async function captureScreenshotPng(session) {
  const result = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  if (!result?.data) {
    throw new Error("Page.captureScreenshot returned no data");
  }
  return Buffer.from(result.data, "base64");
}
