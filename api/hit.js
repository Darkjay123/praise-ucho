// Counts one visit per browser per day (the page only calls this once a day per visitor).
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python/i;
const lagosDay = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 10);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (req.headers['x-pu'] !== '1' || BOT.test(String(req.headers['user-agent'] || ''))) return res.status(204).end();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(204).end();
  try {
    const { put } = require('@vercel/blob');
    await put(`stats/v/${lagosDay()}/v.txt`, '1', { access: 'public', contentType: 'text/plain', addRandomSuffix: true });
  } catch (e) { console.error('hit failed', e.message); }
  res.status(204).end();
};
