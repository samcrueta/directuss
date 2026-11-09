/**
 * A deliberately tiny Directus endpoint extension.
 *
 * The Advanced Directus course uses this to show that API extensions are
 * regular server routes mounted by Directus under the extension name.
 */
export default (router) => {
  router.get('/hello', (_req, res) => {
    res.json({
      ok: true,
      message: 'Hello from a Directus endpoint extension',
      extension: 'labs-endpoint',
      directus: '12.x',
      timestamp: new Date().toISOString()
    });
  });

  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
};
