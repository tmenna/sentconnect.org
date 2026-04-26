/**
 * Storage routes — backed by Cloudflare R2 (S3-compatible via AWS SDK v3).
 *
 * POST /api/storage/uploads
 *   Accepts multipart/form-data with a "file" field.
 *   Streams directly from the request to R2 — no bytes buffered on disk.
 *   Returns { objectKey, objectPath }.
 *
 * POST /api/storage/upload-url
 *   Returns a presigned PUT URL for future direct browser → R2 uploads.
 *   Requires CORS to be enabled on the R2 bucket before browsers can use it.
 *
 * GET /api/storage/objects/*path
 *   Generates a 1-hour presigned GET URL and 302-redirects to it.
 *   Browser fetches content straight from R2 — no byte proxying through our server.
 *
 * GET /api/storage/file-url?key=…
 *   Returns a presigned GET URL as JSON (for programmatic / server-side callers).
 */

import { Router, type IRouter, type Request, type Response } from "express";
import busboy from "busboy";
import {
  uploadStreamToR2,
  createPresignedPutUrl,
  createPresignedGetUrl,
  objectPathToKey,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../lib/r2Storage";

const router: IRouter = Router();

// ── POST /api/storage/uploads ─────────────────────────────────────────────────
// Accepts multipart/form-data with a "file" field.
// Streams the file directly to R2 — bytes never land on disk or memory buffer.
router.post("/storage/uploads", (req: Request, res: Response) => {
  const contentLength = parseInt(req.headers["content-length"] ?? "0", 10);
  if (contentLength > MAX_FILE_SIZE_BYTES) {
    res.status(413).json({ error: "File too large. Maximum is 200 MB." });
    return;
  }

  // orgId from the authenticated session for namespaced key structure
  const orgId = (req.session as any)?.orgId ?? null;

  let settled = false;
  function fail(status: number, message: string) {
    if (settled) return;
    settled = true;
    res.status(status).json({ error: message });
  }

  try {
    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_FILE_SIZE_BYTES },
    });

    bb.on("file", (_fieldname, fileStream, info) => {
      const { filename, mimeType } = info;

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        fileStream.resume(); // drain & discard
        fail(
          400,
          `File type "${mimeType}" is not allowed. Only images and videos are accepted.`
        );
        return;
      }

      // Stream directly to R2
      uploadStreamToR2(fileStream as any, mimeType, filename, contentLength, orgId)
        .then(({ objectKey, objectPath }) => {
          if (settled) return;
          settled = true;
          res.json({ objectKey, objectPath });
        })
        .catch((err: any) => {
          req.log.error({ err }, "R2 upload failed");
          fail(500, err.message ?? "Upload to storage failed");
        });
    });

    bb.on("fieldsLimit", () => fail(400, "Unexpected extra fields in upload"));
    bb.on("filesLimit", () => fail(400, "Only one file per request is allowed"));
    bb.on("error", (err: any) => {
      req.log.error({ err }, "Busboy parse error");
      fail(500, "Failed to parse upload");
    });

    req.pipe(bb);
  } catch (err: any) {
    req.log.error({ err }, "Upload setup error");
    fail(500, "Upload failed");
  }
});

// ── POST /api/storage/upload-url ──────────────────────────────────────────────
// Generates a presigned PUT URL for direct browser → R2 uploads.
// CORS is already enabled on the R2 bucket for sentconnect.org.
//
// Body: { fileName, contentType, orgId?, postId? }
// Returns: { uploadUrl, objectKey, objectPath, expiresIn }
router.post("/storage/upload-url", async (req: Request, res: Response) => {
  const { fileName, contentType, orgId, postId } = req.body ?? {};

  if (!fileName || !contentType) {
    res.status(400).json({ error: "fileName and contentType are required" });
    return;
  }
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    res.status(400).json({
      error: `File type "${contentType}" is not allowed. Only images and videos are accepted.`,
    });
    return;
  }

  // Validate file size via optional fileSize body field
  const fileSize = Number(req.body.fileSize ?? 0);
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    res.status(400).json({ error: "File too large. Maximum is 200 MB." });
    return;
  }

  try {
    const result = await createPresignedPutUrl(
      contentType,
      fileName,
      orgId ?? null,
      postId ?? null,
      300 // 5-minute expiry
    );

    res.json({
      uploadUrl: result.uploadURL,   // what the browser PUTs to
      objectKey: result.objectKey,   // store this in the database
      objectPath: result.objectPath, // use for /api/storage/objects/* lookups
      expiresIn: result.expiresIn,
    });
  } catch (err: any) {
    req.log.error({ err }, "Error generating presigned PUT URL");
    res.status(500).json({ error: err.message ?? "Failed to generate upload URL" });
  }
});

// ── GET /api/storage/objects/* ────────────────────────────────────────────────
// Resolves a stored objectPath to a 1-hour presigned GET URL, then redirects.
// The browser fetches content straight from R2 — zero byte proxying.
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  const raw = req.params.path;
  const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
  const objectKey = objectPathToKey(`/objects/${wildcardPath}`);

  if (!objectKey) {
    res.status(400).json({ error: "Invalid object path" });
    return;
  }

  try {
    const signedUrl = await createPresignedGetUrl(objectKey, 3600);
    // Cache the redirect for 55 min (safely inside the 1-hour presigned URL window).
    // This means repeat visitors skip the API entirely on subsequent image loads.
    res
      .set("Cache-Control", "public, max-age=3300")
      .redirect(302, signedUrl);
  } catch (err: any) {
    req.log.error({ err }, "Error generating presigned GET URL");
    res.status(500).json({ error: "Failed to generate file URL" });
  }
});

// ── GET /api/storage/file-url?key=… ──────────────────────────────────────────
// Returns a presigned GET URL as JSON for programmatic / server-side callers.
router.get("/storage/file-url", async (req: Request, res: Response) => {
  const key = req.query.key as string | undefined;
  if (!key) {
    res.status(400).json({ error: "key query parameter is required" });
    return;
  }

  try {
    const url = await createPresignedGetUrl(key, 3600);
    res.json({ url, expiresIn: 3600 });
  } catch (err: any) {
    req.log.error({ err }, "Error generating file URL");
    res.status(500).json({ error: "Failed to generate file URL" });
  }
});

export default router;
