/**
 * Storage routes — backed by Linode Object Storage (S3-compatible).
 *
 * POST /api/storage/uploads
 *   → Accepts multipart/form-data with a "file" field.
 *     Streams the file directly from the request to Linode. No bytes buffered on disk.
 *     Returns { objectKey, objectPath } on success.
 *
 * GET /api/storage/objects/*path
 *   → Generates a short-lived (1 h) presigned GET URL and 302-redirects to it.
 *     The browser fetches content directly from Linode CDN — no byte proxying.
 *
 * GET /api/storage/file-url?key=uploads/...
 *   → Returns a presigned GET URL as JSON (useful for programmatic callers).
 */

import { Router, type IRouter, type Request, type Response } from "express";
import busboy from "busboy";
import {
  uploadStream,
  createPresignedGetUrl,
  objectPathToKey,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "../lib/linodeStorage";

const router: IRouter = Router();

// ── POST /api/storage/uploads ─────────────────────────────────────────────────
// Accepts multipart/form-data with a "file" field.
// Streams file directly to Linode — file bytes never land on disk.
router.post("/storage/uploads", (req: Request, res: Response) => {
  const contentLength = parseInt(req.headers["content-length"] ?? "0", 10);
  if (contentLength > MAX_FILE_SIZE) {
    res.status(413).json({ error: "File too large. Maximum is 200 MB." });
    return;
  }

  let settled = false;

  function fail(status: number, message: string) {
    if (settled) return;
    settled = true;
    res.status(status).json({ error: message });
  }

  try {
    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_FILE_SIZE },
    });

    bb.on("file", (_fieldname, fileStream, info) => {
      const { filename, mimeType } = info;

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        fileStream.resume(); // drain and discard
        fail(400, `File type "${mimeType}" is not allowed. Only images and videos are accepted.`);
        return;
      }

      // Stream the file body directly to Linode
      uploadStream(fileStream as any, mimeType, filename, contentLength)
        .then(({ objectKey, objectPath }) => {
          if (settled) return;
          settled = true;
          res.json({ objectKey, objectPath });
        })
        .catch((err: any) => {
          req.log.error({ err }, "Linode upload failed");
          fail(500, err.message ?? "Upload to storage failed");
        });
    });

    bb.on("fieldsLimit", () => fail(400, "Unexpected fields in upload"));
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

// ── GET /api/storage/objects/* ────────────────────────────────────────────────
// Resolves the stored objectPath to a short-lived Linode presigned GET URL,
// then 302-redirects. The browser fetches content directly from Linode CDN.
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
    res.redirect(302, signedUrl);
  } catch (err: any) {
    req.log.error({ err }, "Error generating presigned GET URL");
    res.status(500).json({ error: "Failed to generate file URL" });
  }
});

// ── GET /api/storage/file-url?key=uploads/<uuid>.ext ─────────────────────────
// Returns a presigned GET URL as JSON (useful for server-side or API callers).
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
