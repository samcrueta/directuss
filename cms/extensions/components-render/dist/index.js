/**
 * Renders a saved Component Studio component as a standalone HTML document.
 *
 * The endpoint only assembles HTML. It never evaluates user JavaScript on the
 * server. The browser displays the document inside a sandboxed iframe.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SECURITY_POLICY = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src data:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'"
].join("; ");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function buildDocument(component) {
  const name = escapeHtml(component.name || "Component");
  const html = component.html || "";
  const css = component.css || "";
  const js = component.js || "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <style>
    html, body { margin: 0; min-height: 100%; }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111827;
      background: #ffffff;
    }
    ${css}
  </style>
  <script>
    (() => {
      const send = (type, level, text) => {
        try {
          parent.postMessage({ source: "lumina-component", type, level, text }, "*");
        } catch {}
      };

      const serialize = (value) => {
        if (typeof value === "string") return value;
        if (value instanceof Error) return value.stack || value.message;
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return String(value);
        }
      };

      ["log", "info", "warn", "error", "debug"].forEach((level) => {
        const original = console[level] ? console[level].bind(console) : () => {};
        console[level] = (...args) => {
          original(...args);
          send("console", level === "debug" ? "log" : level, args.map(serialize).join(" "));
        };
      });

      window.addEventListener("error", (event) => {
        const location = event.lineno ? \` (line \${event.lineno})\` : "";
        send("error", "error", (event.message || "Unknown error") + location);
      });

      window.addEventListener("unhandledrejection", (event) => {
        send("error", "error", serialize(event.reason));
      });
    })();
  </script>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
}

export default (router, context) => {
  router.get("/:id", async (req, res) => {
    const configuredSecret = context.env?.LAB_SECRET || process.env.LAB_SECRET;
    if (configuredSecret && req.headers["x-lumina-render"] !== configuredSecret) {
      res.status(401).send("Unauthorized");
      return;
    }

    const id = req.params.id;
    if (!UUID_PATTERN.test(id)) {
      res.status(400).send("Invalid component id");
      return;
    }

    try {
      const component = await context.database("components").where({ id }).first();
      if (!component) {
        res.status(404).send("Component not found");
        return;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Security-Policy", SECURITY_POLICY);
      res.send(buildDocument(component));
    } catch (error) {
      context.logger?.error?.(error);
      res.status(500).send("Could not render component");
    }
  });
};
