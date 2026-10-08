# Praise Ucho · portfolio

A single page that reads like a book, plus a private editing desk at `/admin`.

- `index.html` renders everything from the content (saved version first, `content.default.json` as fallback).
- `/admin` is Praise's desk: edit every chapter with a live preview, upload a photo, publish, and restore past versions from History.
- `api/` holds small serverless functions. Published content and photos live in Vercel Blob; every publish is kept as its own version (last 40).

Needs two settings on the Vercel project: a Blob store connected (gives `BLOB_READ_WRITE_TOKEN`) and `ADMIN_PASSWORD`.
