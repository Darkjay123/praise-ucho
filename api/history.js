const { guard, versions } = require('./_lib');
module.exports = async (req, res) => {
  if (!(await guard(req, res))) return;
  try {
    const v = await versions();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ versions: v.map(x => ({ url: x.url, savedAt: x.uploadedAt, size: x.size })) });
  } catch (e) { res.status(500).json({ error: 'Could not read past versions.' }); }
};
