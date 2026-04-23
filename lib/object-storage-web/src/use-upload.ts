import { useState, useCallback } from "react";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

interface UploadResponse {
  /** Presigned POST URL */
  uploadURL: string;
  /** Policy fields required for the presigned POST */
  fields: Record<string, string>;
  /** Raw object key (e.g. uploads/<uuid>.jpg) */
  objectKey: string;
  /** Logical path stored in DB (e.g. /objects/uploads/<uuid>.jpg) */
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  /** Base path where object storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for handling file uploads via Linode Object Storage presigned POST.
 *
 * Flow:
 * 1. Call backend POST /api/storage/uploads/request-url to get presigned POST URL + fields.
 * 2. Build a FormData with the policy fields + the file and POST directly to Linode.
 *    File bytes never touch our API server.
 * 3. Store the returned objectPath in the database.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const requestUploadUrl = useCallback(
    async (file: File): Promise<UploadResponse> => {
      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      return response.json();
    },
    [basePath]
  );

  const uploadToPresignedUrl = useCallback(
    async (file: File, uploadURL: string, fields: Record<string, string>): Promise<void> => {
      const form = new FormData();
      // Policy fields must come before the file
      for (const [key, value] of Object.entries(fields)) {
        form.append(key, value);
      }
      form.append("file", file);

      const response = await fetch(uploadURL, { method: "POST", body: form });
      if (!response.ok) {
        throw new Error("Failed to upload file to storage");
      }
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);
        const uploadResponse = await requestUploadUrl(file);

        setProgress(30);
        await uploadToPresignedUrl(file, uploadResponse.uploadURL, uploadResponse.fields ?? {});

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error("Upload failed");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl, uploadToPresignedUrl, options]
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}
