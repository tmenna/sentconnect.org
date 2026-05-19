import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { join, extname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const PUBLIC_DIR = resolve(__dirname, "dist/public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
};

async function send(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const isHtml = ext === ".html";
  let content;
  try {
    content = await readFile(filePath);
  } catch {
    return false;
  }
  res.writeHead(200, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": isHtml
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=31536000, immutable",
    ...(isHtml ? { Pragma: "no-cache", Expires: "0" } : {}),
  });
  res.end(content);
  return true;
}

createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", "http://x").pathname;
  const filePath = join(PUBLIC_DIR, pathname);

  try {
    const s = await stat(filePath);
    if (s.isFile()) {
      await send(res, filePath);
      return;
    }
    if (s.isDirectory()) {
      if (await send(res, join(filePath, "index.html"))) return;
    }
  } catch {
    // fall through to SPA fallback
  }

  // SPA fallback — serve index.html for all unmatched routes
  if (!(await send(res, join(PUBLIC_DIR, "index.html")))) {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Static server on port ${PORT}`);
});
