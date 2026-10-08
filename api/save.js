const { guard, versions, body, PREFIX } = require('./_lib');
const KEEP = 40;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!(await guard(req, res))) return;
  const c = body(req).content;
  if (!c || typeof c !== 'object' || !c.hero || !c.letter || typeof c.name !== 'string')
    return res.status(400).json({ error: 'That does not look like a full portfolio.' });
  const json = JSON.stringify(c);
  if (json.length > 600000) return res.status(413).json({ error: 'Too much text in one go (over 600 KB).' });
  try {
    const { put, del } = require('@vercel/blob');
    const b = await put(`${PREFIX}${Date.now()}.json`, json, { access: 'public', contentType: 'application/json', addRandomSuffix: true });
    const v = await versions();
    const old = v.slice(KEEP).map(x => x.url);
    if (old.length) await del(old).catch(() => {});
    res.status(200).json({ ok: true, savedAt: new Date().toISOString(), url: b.url });
  } catch (e) {
    console.error('save failed', e.message);
    res.status(500).json({ error: 'Saving failed on the server. Nothing was changed.' });
  }
};
