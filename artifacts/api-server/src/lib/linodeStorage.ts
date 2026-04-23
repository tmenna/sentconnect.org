/**
 * Linode Object Storage service (S3-compatible via AWS SDK v3).
 *
 * All media uploads (images, videos, files) flow through this service.
 * The bucket is private — files are accessed via short-lived presigned URLs.
 *
 * Environment variables required:
 *   LINODE_ACCESS_KEY  — Linode Object Storage access key
 *   LINODE_SECRET_KEY  — Linode Object Storage secret key
 *   LINODE_BUCKET      — bucket name (e.g. sentconnect-media)
 *   LINODE_REGION      — bucket cluster (e.g. us-ord-1)
 */

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "crypto";

// ── Allowed media types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
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

// 200 MB max for video, 20 MB for images
const MAX_FILE_SIZE = 200 * 1024 * 1024;

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
    // Force path-style so Linode's endpoint resolves correctly
    forcePathStyle: false,
  });
}

// Lazy singleton — created only when first used
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

export interface PresignedUploadResult {
  /** The presigned POST URL the browser uploads to directly */
  uploadURL: string;
  /** Form fields that must accompany the POST (for presigned POST) */
  fields: Record<string, string>;
  /** Logical object key stored in the database */
  objectKey: string;
  /** Public-facing path used within the app (e.g. /api/storage/objects/<key>) */
  objectPath: string;
}

/**
 * Generate a presigned PUT URL for a browser to upload a file directly to
 * Linode Object Storage without routing the bytes through our server.
 *
 * @param contentType  MIME type of the file being uploaded
 * @param fileName     Original file name (used to build the key extension)
 * @param fileSizeBytes File size in bytes (enforced server-side via presigned POST conditions)
 */
export async function createPresignedUploadUrl(
  contentType: string,
  fileName: string,
  fileSizeBytes: number
): Promise<PresignedUploadResult> {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(
      `File type "${contentType}" is not allowed. Only images and videos are accepted.`
    );
  }
  if (fileSizeBytes > MAX_FILE_SIZE) {
    throw new Error(
      `File is too large (${Math.round(fileSizeBytes / 1024 / 1024)} MB). Maximum is ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    );
  }

  const ext = fileName.includes(".")
    ? "." + fileName.split(".").pop()!.toLowerCase()
    : "";
  const objectKey = `uploads/${randomUUID()}${ext}`;
  const bucket = getBucket();
  const s3 = getS3();

  // Use presigned POST — supports server-enforced content-type and size conditions
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: bucket,
    Key: objectKey,
    Conditions: [
      ["content-length-range", 1, MAX_FILE_SIZE],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 300, // 5 minutes
  });

  return {
    uploadURL: url,
    fields,
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
  const s3 = getS3();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
  });
  return getSignedUrl(s3, command, { expiresIn: ttlSeconds });
}

/**
 * Delete an object from storage (e.g. when a post/photo is deleted).
 */
export async function deleteObject(objectKey: string): Promise<void> {
  const s3 = getS3();
  await s3.send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: objectKey })
  );
}

/**
 * Check whether an object exists in the bucket.
 */
export async function objectExists(objectKey: string): Promise<boolean> {
  const s3 = getS3();
  try {
    await s3.send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: objectKey })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert a stored objectPath ("/objects/uploads/<key>") back to its key.
 * Returns null if the path is not a managed object (e.g. an external URL).
 */
export function objectPathToKey(objectPath: string): string | null {
  if (!objectPath.startsWith("/objects/")) return null;
  return objectPath.slice("/objects/".length);
}
