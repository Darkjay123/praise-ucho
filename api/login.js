const { guard } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!(await guard(req, res))) return;
  res.status(200).json({ ok: true, storage: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
};
