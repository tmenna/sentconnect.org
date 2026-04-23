/**
 * Cloudflare R2 Storage Service (S3-compatible via AWS SDK v3).
 *
 * Architecture:
 *   Browser → POST /api/storage/uploads → this service → R2 bucket (private)
 *   Serve:   GET  /api/storage/objects/* → presigned GET redirect → R2 CDN
 *
 * Environment variables (set in Replit Secrets / Render environment):
 *   R2_ACCESS_KEY_ID      — R2 API token access key
 *   R2_SECRET_ACCESS_KEY  — R2 API token secret key
 *   R2_BUCKET             — bucket name (e.g. sentconnect-media)
 *   R2_ENDPOINT           — https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 */

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import type { Readable } from "stream";

// ─────────────────────────────────────────────────────────────────────────────
// Config & Validation
// ─────────────────────────────────────────────────────────────────────────────

/** Allowed MIME types. Reject anything that is not an image or video. */
export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
]);

/** 200 MB hard limit — large enough for video, safe for R2 free-tier egress. */
export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// S3 Client (lazy singleton)
// ─────────────────────────────────────────────────────────────────────────────

function createR2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 credentials. " +
        "Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    // R2 uses "auto" as the region — it routes to the closest location automatically
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

let _r2: S3Client | null = null;

/** Returns the lazily-initialized R2 S3 client. */
function getR2(): S3Client {
  if (!_r2) _r2 = createR2Client();
  return _r2;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET env var is not set.");
  return bucket;
}

// ─────────────────────────────────────────────────────────────────────────────
// Object Key Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a structured object key.
 *
 * Key patterns (most to least specific):
 *   organizations/{orgId}/posts/{postId}/{uuid}.ext  ← post media (preferred)
 *   organizations/{orgId}/uploads/{uuid}.ext          ← org-scoped, no post yet
 *   uploads/{uuid}.ext                                ← fallback (logos, misc)
 */
export function buildObjectKey(
  fileName: string,
  orgId?: string | number | null,
  postId?: string | number | null
): string {
  const uuid = randomUUID();
  const ext = fileName.includes(".")
    ? "." + fileName.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";

  if (orgId && postId) {
    return `organizations/${orgId}/posts/${postId}/${uuid}${ext}`;
  }
  if (orgId) {
    return `organizations/${orgId}/uploads/${uuid}${ext}`;
  }
  return `uploads/${uuid}${ext}`;
}

/**
 * Convert a stored objectPath ("/objects/…") back to the R2 object key.
 * Returns null when the path is an external URL (e.g. a pasted https:// logo).
 */
export function objectPathToKey(objectPath: string): string | null {
  if (!objectPath.startsWith("/objects/")) return null;
  return objectPath.slice("/objects/".length);
}

/** Wrap an object key in the logical path used inside the app. */
export function keyToObjectPath(objectKey: string): string {
  return `/objects/${objectKey}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload — Server-side stream to R2
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResult {
  objectKey: string;
  objectPath: string;
}

/**
 * Stream a file from an incoming request body directly into R2.
 *
 * Uses AWS multipart upload under the hood via @aws-sdk/lib-storage so large
 * files are handled safely and efficiently without buffering to disk.
 *
 * @param stream      Node.js Readable stream of the file body
 * @param contentType MIME type (validated before calling this)
 * @param fileName    Original file name (used to derive extension + key)
 * @param sizeBytes   Declared file size in bytes (validated before calling)
 * @param orgId       Optional organisation ID for namespaced key structure
 */
export async function uploadStreamToR2(
  stream: Readable,
  contentType: string,
  fileName: string,
  sizeBytes: number,
  orgId?: string | null
): Promise<UploadResult> {
  // ── Validate ──────────────────────────────────────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(
      `File type "${contentType}" is not allowed. Only images and videos are accepted.`
    );
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File is too large (${Math.round(sizeBytes / 1024 / 1024)} MB). ` +
        `Maximum allowed is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`
    );
  }

  // ── Build key & upload ────────────────────────────────────────────────────
  const objectKey = buildObjectKey(fileName, orgId);

  const upload = new Upload({
    client: getR2(),
    params: {
      Bucket: getBucket(),
      Key: objectKey,
      Body: stream,
      ContentType: contentType,
    },
    partSize: 5 * 1024 * 1024, // 5 MB per part
    queueSize: 4,               // up to 4 concurrent parts
  });

  await upload.done();

  return {
    objectKey,
    objectPath: keyToObjectPath(objectKey),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Presigned PUT URL — Direct browser → R2 upload (future upgrade path)
// ─────────────────────────────────────────────────────────────────────────────

export interface PresignedPutResult {
  uploadURL: string;
  objectKey: string;
  objectPath: string;
  expiresIn: number;
}

/**
 * Generate a presigned PUT URL for direct browser → R2 uploads.
 *
 * Requires CORS to be configured on the R2 bucket (already done for sentconnect.org).
 * The browser PUTs the file directly to R2 — bytes never touch our server.
 *
 * @param contentType MIME type of the file to be uploaded
 * @param fileName    Original file name (used to derive extension + key)
 * @param orgId       Organisation ID (for key namespacing)
 * @param postId      Post ID (for key namespacing under the post)
 * @param ttlSeconds  URL expiry (default 5 minutes)
 */
export async function createPresignedPutUrl(
  contentType: string,
  fileName: string,
  orgId?: string | number | null,
  postId?: string | number | null,
  ttlSeconds = 300
): Promise<PresignedPutResult> {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(
      `File type "${contentType}" is not allowed. Only images and videos are accepted.`
    );
  }

  const objectKey = buildObjectKey(fileName, orgId, postId);

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(getR2(), command, {
    expiresIn: ttlSeconds,
  });

  return {
    uploadURL,
    objectKey,
    objectPath: keyToObjectPath(objectKey),
    expiresIn: ttlSeconds,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Presigned GET URL — Secure file access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a short-lived presigned GET URL for a private R2 object.
 * Default expiry is 1 hour.
 */
export async function createPresignedGetUrl(
  objectKey: string,
  ttlSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
  });
  return getSignedUrl(getR2(), command, { expiresIn: ttlSeconds });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently delete an object from R2.
 * Call this when a post or photo record is deleted.
 */
export async function deleteR2Object(objectKey: string): Promise<void> {
  await getR2().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: objectKey })
  );
}

/**
 * Check whether an object exists in the bucket without downloading it.
 */
export async function r2ObjectExists(objectKey: string): Promise<boolean> {
  try {
    await getR2().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: objectKey })
    );
    return true;
  } catch {
    return false;
  }
}
