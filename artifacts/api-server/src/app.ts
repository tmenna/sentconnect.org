import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
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

export default app;
