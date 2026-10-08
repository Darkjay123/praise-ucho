const { guard, body } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!(await guard(req, res))) return;
  const { dataUrl, name } = body(req);
  const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) return res.status(400).json({ error: 'Please pick a JPG, PNG or WebP image.' });
  const buf = Buffer.from(m[3], 'base64');
  if (buf.length > 3.5 * 1024 * 1024) return res.status(413).json({ error: 'That image is too big (max 3.5 MB after resizing).' });
  const slug = String(name || 'photo').toLowerCase().replace(/\.[a-z]+$/, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'photo';
  try {
    const { put } = require('@vercel/blob');
    const b = await put(`site/img/${slug}.${m[2] === 'jpeg' ? 'jpg' : m[2]}`, buf, { access: 'public', contentType: m[1], addRandomSuffix: true });
    res.status(200).json({ url: b.url });
  } catch (e) { console.error('upload failed', e.message); res.status(500).json({ error: 'Upload failed on the server.' }); }
};
