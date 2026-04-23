/**
 * Storage routes — backed by Linode Object Storage (S3-compatible).
 *
 * POST /api/storage/uploads/request-url
 *   → Returns a presigned POST URL + fields. Browser uploads directly to Linode.
 *
 * GET /api/storage/objects/*
 *   → Returns a short-lived presigned GET URL for private media (redirect).
 *
 * GET /api/storage/file-url?key=uploads/...
 *   → Explicit presigned GET URL endpoint (useful for server-side rendering).
 */

import { Router, type IRouter, type Request, type Response } from "express";
import {
  createPresignedUploadUrl,
  createPresignedGetUrl,
  objectPathToKey,
} from "../lib/linodeStorage";

const router: IRouter = Router();

// ── POST /api/storage/uploads/request-url ─────────────────────────────────────
// The browser sends file metadata (NOT the file itself).
// Returns a presigned POST URL + form fields.
// The browser then POSTs the file directly to Linode — bytes never hit our server.
router.post(
  "/storage/uploads/request-url",
  async (req: Request, res: Response) => {
    const { name, size, contentType } = req.body ?? {};

    if (!name || !contentType) {
      res.status(400).json({ error: "name and contentType are required" });
      return;
    }

    const fileSizeBytes = Number(size) || 0;

    try {
      const result = await createPresignedUploadUrl(
        contentType,
        name,
        fileSizeBytes
      );

      res.json({
        // Legacy field name kept so existing frontend code (useUpload hook) works unchanged
        uploadURL: result.uploadURL,
        fields: result.fields,
        objectKey: result.objectKey,
        // objectPath is what gets stored in the photos.url DB column
        objectPath: result.objectPath,
        metadata: { name, size: fileSizeBytes, contentType },
      });
    } catch (err: any) {
      req.log.error({ err }, "Error generating presigned upload URL");
      res.status(400).json({ error: err.message ?? "Failed to generate upload URL" });
    }
  }
);

// ── GET /api/storage/objects/* ────────────────────────────────────────────────
// Resolves a stored objectPath to a short-lived Linode presigned GET URL.
// Redirects the browser directly to Linode — no byte proxying through our server.
router.get(
  "/storage/objects/*path",
  async (req: Request, res: Response) => {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectKey = objectPathToKey(objectPath);

    if (!objectKey) {
      res.status(400).json({ error: "Invalid object path" });
      return;
    }

    try {
      const signedUrl = await createPresignedGetUrl(objectKey, 3600);
      // 302 redirect — browser fetches content directly from Linode CDN
      res.redirect(302, signedUrl);
    } catch (err: any) {
      req.log.error({ err }, "Error generating presigned GET URL");
      res.status(500).json({ error: "Failed to generate file URL" });
    }
  }
);

// ── GET /api/storage/file-url?key=uploads/<uuid>.ext ─────────────────────────
// Returns a presigned GET URL as JSON (useful for server-rendered or API callers).
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

// ── Legacy public-objects route (kept for backward compat) ────────────────────
// Previously served static assets from GCS. Now a no-op stub.
router.get("/storage/public-objects/*filePath", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Public objects are not available in this configuration." });
});

export default router;
