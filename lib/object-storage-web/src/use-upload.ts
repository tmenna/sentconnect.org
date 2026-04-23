import { useState, useCallback } from "react";

interface UploadResult {
  objectKey: string;
  objectPath: string;
}

interface UseUploadOptions {
  /** Base path where storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for uploading files to Linode Object Storage via the API proxy.
 *
 * Flow:
 * 1. POST the file as multipart/form-data to /api/storage/uploads.
 * 2. The API server streams it directly to Linode (no disk buffering).
 * 3. Returns objectPath to store in the database.
 *    Files are served back via /api/storage/objects/<path> (presigned redirect).
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(20);

        const form = new FormData();
        form.append("file", file);

        const response = await fetch(`${basePath}/uploads`, {
          method: "POST",
          body: form,
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        setProgress(100);
        const result: UploadResult = await response.json();
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error("Upload failed");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [basePath, options]
  );

  return { uploadFile, isUploading, error, progress };
}
