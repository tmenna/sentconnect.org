---
name: R2 image caching
description: Why R2-served images (logo, About image, feed photos) load laggy and how presigned-URL stability + cache headers fix it
---

# R2 image caching (SentConnect)

All app media is stored as stable `/api/storage/objects/<key>` paths but served
from a **private** Cloudflare R2 bucket via presigned GET URLs. Two serving paths,
both funneling through `createPresignedGetUrl` in `artifacts/api-server/src/lib/r2Storage.ts`:
- logo + feed photos → presigned URL inlined in JSON (`resolveObjectUrl` / `resolveObjectUrls`)
- About image → raw path rendered by `<img>` → `/api/storage/objects/*` 302 redirect route

## The lag (root cause)
A presigned GET URL includes a time-based `X-Amz-Signature`. If a fresh signature
is minted on every call, the URL changes on every API response, so the browser's
byte cache (keyed by full URL) always misses → it re-downloads the image every page
view. Additionally the presigned response carried no cache headers.

## The fix (two independent levers, both required)
1. **Stable URL** — cache signed URLs server-side (in-memory Map keyed by
   `objectKey|ttl`), reuse while >10% of lifetime remains. Same URL across
   responses → browser byte cache hits.
2. **Cacheable bytes** — pass `ResponseCacheControl: "public, max-age=31536000, immutable"`
   on the `GetObjectCommand`. R2 echoes it as `response-cache-control`, so the browser
   caches the bytes. **Safe because object keys are content-addressed random UUIDs**
   — the bytes at a key never change. If keys were ever reused/overwritten, immutable
   would be dangerous.

**Why both:** cache headers alone do nothing while the URL rotates (cache keyed by
URL); a stable URL alone doesn't help if the bytes aren't cacheable.

## Stale-redirect trap (the non-obvious constraint)
The `/api/storage/objects/*` route sets its own `Cache-Control` on the **302 itself**.
A browser-cached 302 must never outlive the presigned URL it points to, or it serves
a cached redirect to an expired signature → intermittent 403s.
- Reused URLs are refreshed at <10% remaining, so min guaranteed remaining ≈ 10% of TTL.
- With 24h (86400s) TTL that floor is ~2.4h → keep the 302's `max-age` well under it (using 1h).
- Inlined presigned URLs (in JSON) don't hit this: the JSON has a short cache
  (~5min) so the browser always re-reads a fresh URL far inside its validity.

## Known limitation
The presigned-URL cache is **per-instance**. Under multi-instance / cold-start
scaling on Render, URL stability degrades (more distinct URLs, fewer cache hits) —
a graceful perf degradation, not a correctness bug. A shared cache (Redis) would
fully stabilize it if ever needed.
