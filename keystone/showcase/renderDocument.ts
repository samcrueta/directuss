const RESET_CSS = `html, body { margin: 0; min-height: 100%; }
*, *::before, *::after { box-sizing: border-box; }
body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  background: #ffffff;
}`

const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src data:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ')

function escapeClosingTag(value: string, tag: 'style' | 'script') {
  return value.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`)
}

export function renderDocument({
  html = '',
  css = '',
  js = '',
}: {
  html?: string
  css?: string
  js?: string
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}">
  <title>Learner component</title>
  <style>${RESET_CSS}
${escapeClosingTag(css, 'style')}</style>
</head>
<body>
${html}
<script>${escapeClosingTag(js, 'script')}</script>
</body>
</html>`
}
