import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import billingRouter from "./routes/billing";
import { logger } from "./lib/logger";
import { resolveOrg } from "./middleware/org-resolver";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const PgSession = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

// Webhook must receive raw body — register BEFORE express.json()
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res, next) => {
    // Delegate to billingRouter's /webhooks/stripe handler
    billingRouter(req, res, next);
  }
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/public", express.static(path.resolve(process.cwd(), "public")));

app.use("/api", resolveOrg, router);

const frontendDist = [
  path.resolve(process.cwd(), "../mission-reports/dist/public"),
  path.resolve(process.cwd(), "artifacts/mission-reports/dist/public"),
].find((dir) => existsSync(path.join(dir, "index.html")));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else if (process.env.NODE_ENV === "production") {
  logger.warn("Frontend build output was not found. Root route will not serve the web app.");
}

// JSON 404 for any unmatched /api/* routes (must come after the SPA catch-all so
// non-API unmatched paths still serve index.html)
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Global JSON error handler — prevents Express from returning an HTML 500 page
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "Unhandled error");
  const status = (err as { status?: number; statusCode?: number })?.status ??
    (err as { statusCode?: number })?.statusCode ?? 500;
  const message = (err as { message?: string })?.message ?? "Internal server error";
  res.status(status).json({ error: message });
});

export default app;
