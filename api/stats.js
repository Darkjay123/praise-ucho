const { guard } = require('./_lib');
const day = (ms) => new Date(ms + 3600e3).toISOString().slice(0, 10); // Lagos time (UTC+1)

module.exports = async (req, res) => {
  if (!(await guard(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { list } = require('@vercel/blob');
    const by = {};
    let cursor;
    do {
      const r = await list({ prefix: 'stats/v/', cursor, limit: 1000 });
      for (const b of r.blobs) { const d = b.pathname.split('/')[2]; if (d) by[d] = (by[d] || 0) + 1; }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    const now = Date.now();
    const sumLast = (n) => { let s = 0; for (let i = 0; i < n; i++) s += by[day(now - i * 864e5)] || 0; return s; };
    const days = [];
    for (let i = 13; i >= 0; i--) { const d = day(now - i * 864e5); days.push({ day: d, count: by[d] || 0 }); }
    const total = Object.values(by).reduce((a, b) => a + b, 0);
    const first = Object.keys(by).sort()[0] || null;
    res.status(200).json({ today: by[day(now)] || 0, week: sumLast(7), month: sumLast(30), total, since: first, days });
  } catch (e) {
    console.error('stats failed', e.message);
    res.status(500).json({ error: 'Could not read visitor numbers.' });
  }
};
