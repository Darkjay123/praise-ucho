const crypto = require('crypto');
const DEFAULT = require('../content.default.json');
const PREFIX = 'site/content-';

function auth(req) {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) return { ok: false, code: 503, error: 'The admin password has not been set up yet.' };
  const got = String(req.headers['x-admin-key'] || '');
  const a = crypto.createHash('sha256').update(got).digest();
  const b = crypto.createHash('sha256').update(key).digest();
  return crypto.timingSafeEqual(a, b) ? { ok: true } : { ok: false, code: 401, error: 'That password is not right.' };
}

async function guard(req, res) {
  const a = auth(req);
  if (a.ok) return true;
  if (a.code === 401) await new Promise(r => setTimeout(r, 700));
  res.status(a.code).json({ error: a.error });
  return false;
}

async function versions() {
  const { list } = require('@vercel/blob');
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out.sort((x, y) => new Date(y.uploadedAt) - new Date(x.uploadedAt));
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

module.exports = { DEFAULT, PREFIX, guard, versions, body };
