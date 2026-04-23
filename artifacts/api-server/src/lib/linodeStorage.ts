/**
 * Linode Object Storage service (S3-compatible via AWS SDK v3).
 *
 * Upload strategy: files are sent to our API server which streams them directly
 * to Linode using PutObject. This avoids any bucket CORS configuration and keeps
 * the bucket fully private. Files are served via short-lived presigned GET URLs.
 *
 * Environment variables required:
 *   LINODE_ACCESS_KEY  — Linode Object Storage access key
 *   LINODE_SECRET_KEY  — Linode Object Storage secret key
 *   LINODE_BUCKET      — bucket name (e.g. sentconnect-media)
 *   LINODE_REGION      — bucket cluster (e.g. us-lax-4)
 */

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import type { Readable } from "stream";

// ── Allowed media types ────────────────────────────────────────────────────────
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
]);

// 200 MB max (large enough for video)
export const MAX_FILE_SIZE = 200 * 1024 * 1024;

// ── S3 client (Linode endpoint) ───────────────────────────────────────────────
function createS3Client(): S3Client {
  const region = process.env.LINODE_REGION;
  const accessKeyId = process.env.LINODE_ACCESS_KEY;
  const secretAccessKey = process.env.LINODE_SECRET_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Linode Object Storage credentials. " +
        "Set LINODE_REGION, LINODE_ACCESS_KEY, and LINODE_SECRET_KEY."
    );
  }

  return new S3Client({
    region,
    endpoint: `https://${region}.linodeobjects.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });
}

let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (!_s3) _s3 = createS3Client();
  return _s3;
}

function getBucket(): string {
  const bucket = process.env.LINODE_BUCKET;
  if (!bucket) throw new Error("LINODE_BUCKET env var is not set.");
  return bucket;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Stream a file from an incoming request directly into Linode Object Storage.
 * Uses AWS multipart upload under the hood so large files are handled safely.
 *
 * @param stream      Readable stream of the file body
 * @param contentType MIME type of the file
 * @param fileName    Original file name (used to derive the extension)
 * @param sizeBytes   File size in bytes (for validation)
 * @returns objectKey  — the key stored in the database (e.g. "uploads/<uuid>.jpg")
 * @returns objectPath — the logical path used in the app (e.g. "/objects/uploads/<uuid>.jpg")
 */
export async function uploadStream(
  stream: Readable,
  contentType: string,
  fileName: string,
  sizeBytes: number
): Promise<{ objectKey: string; objectPath: string }> {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(
      `File type "${contentType}" is not allowed. Only images and videos are accepted.`
    );
  }
  if (sizeBytes > MAX_FILE_SIZE) {
    throw new Error(
      `File is too large (${Math.round(sizeBytes / 1024 / 1024)} MB). ` +
        `Maximum allowed is ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    );
  }

  const ext = fileName.includes(".")
    ? "." + fileName.split(".").pop()!.toLowerCase()
    : "";
  const objectKey = `uploads/${randomUUID()}${ext}`;
  const bucket = getBucket();

  const upload = new Upload({
    client: getS3(),
    params: {
      Bucket: bucket,
      Key: objectKey,
      Body: stream,
      ContentType: contentType,
    },
    // Sane defaults: 5 MB part size, up to 4 concurrent parts
    partSize: 5 * 1024 * 1024,
    queueSize: 4,
  });

  await upload.done();

  return {
    objectKey,
    objectPath: `/objects/${objectKey}`,
  };
}

/**
 * Generate a presigned GET URL so authenticated users can view a private file.
 * URL expires in 1 hour by default.
 */
export async function createPresignedGetUrl(
  objectKey: string,
  ttlSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
  });
  return getSignedUrl(getS3(), command, { expiresIn: ttlSeconds });
}

/**
 * Delete an object from storage (e.g. when a post or photo is deleted).
 */
export async function deleteObject(objectKey: string): Promise<void> {
  await getS3().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: objectKey })
  );
}

/**
 * Check whether an object exists in the bucket.
 */
export async function objectExists(objectKey: string): Promise<boolean> {
  try {
    await getS3().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: objectKey })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert a stored objectPath ("/objects/uploads/<key>") back to its S3 key.
 * Returns null if the path is external (e.g. a pasted https:// URL).
 */
export function objectPathToKey(objectPath: string): string | null {
  if (!objectPath.startsWith("/objects/")) return null;
  return objectPath.slice("/objects/".length);
}
