const { DEFAULT, versions } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const v = await versions();
    if (v.length) {
      const r = await fetch(v[0].url, { cache: 'no-store' });
      if (r.ok) return res.status(200).json({ source: 'saved', savedAt: v[0].uploadedAt, content: await r.json() });
    }
  } catch (e) { console.error('content read failed', e.message); }
  res.status(200).json({ source: 'default', savedAt: null, content: DEFAULT });
};
