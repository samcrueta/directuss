/**
 * Browser-side lab sandbox.
 *
 * This worker has no DOM access and its fetch is restricted to the app's
 * /api/* proxy. It is a learning sandbox, not a hardened multi-tenant
 * execution environment: only run code you are willing to review.
 */

const nativeFetch = self.fetch.bind(self);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function safeStringify(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (_key, item) => {
        if (typeof item === "bigint") return `${item}n`;
        if (typeof item === "function") return `[Function ${item.name || "anonymous"}]`;
        if (typeof item === "object" && item !== null) {
          if (seen.has(item)) return "[Circular]";
          seen.add(item);
        }
        return item;
      },
      2
    );
  } catch {
    return String(value);
  }
}

function format(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === "undefined") return "undefined";
  if (value === null) return "null";
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (typeof value === "object") {
    const json = safeStringify(value);
    return json === undefined ? String(value) : json;
  }
  return String(value);
}

function post(message) {
  self.postMessage(message);
}

function makeConsole() {
  const write = (level) => (...args) => {
    post({ type: "log", level, text: args.map(format).join(" ") });
  };
  return {
    log: write("log"),
    info: write("log"),
    debug: write("log"),
    warn: write("warn"),
    error: write("error"),
    table: (value) => post({ type: "log", level: "log", text: format(value) }),
    clear: () => post({ type: "log", level: "system", text: "(console cleared)" })
  };
}

function safeFetch(input, init) {
  const raw = typeof input === "string" ? input : input?.url;
  let url;
  try {
    url = new URL(raw, self.location.origin);
  } catch {
    throw new Error("Invalid URL.");
  }
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/api/")) {
    throw new Error("Lab fetch is limited to same-origin /api/* requests.");
  }
  return nativeFetch(url.toString(), init);
}

async function request(method, pathname, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await safeFetch(`/api/directus${pathname}`, options);
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = payload;
    throw error;
  }
  return payload;
}

const directus = {
  get: (pathname) => request("GET", pathname),
  post: (pathname, body) => request("POST", pathname, body),
  patch: (pathname, body) => request("PATCH", pathname, body),
  ws: async () => {
    const response = await safeFetch("/api/lab/ws-config");
    const config = await response.json();
    const socket = new WebSocket(config.url);
    socket.addEventListener("error", () => {
      post({ type: "log", level: "error", text: `WebSocket connection failed: ${config.url}` });
    });
    if (config.token) {
      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ type: "auth", access_token: config.token }));
      });
    }
    return socket;
  }
};

self.onmessage = async (event) => {
  const code = event.data?.code;
  if (typeof code !== "string") {
    post({ type: "error", text: "No code was provided." });
    return;
  }

  try {
    // Shadow the obvious escape hatches. This raises the bar for accidental
    // misuse; it is not a replacement for a hardened remote runner.
    const execute = new AsyncFunction(
      "console",
      "directus",
      "fetch",
      "WebSocket",
      "self",
      "globalThis",
      "postMessage",
      "importScripts",
      "XMLHttpRequest",
      code
    );

    const value = await execute(
      makeConsole(),
      directus,
      safeFetch,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    post({
      type: "done",
      resultText: value === undefined ? null : format(value)
    });
  } catch (error) {
    post({
      type: "error",
      text: error?.stack || error?.message || String(error)
    });
  }
};
