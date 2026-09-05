import express, { type Express } from "express";
import ejs from "ejs";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import router from "./routes";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import ordersRouter from "./routes/orders";
import clientsRouter from "./routes/clients";
import productsRouter from "./routes/products";
import stockRouter from "./routes/stock";
import cuentasRouter from "./routes/cuentas";
import { requireAuth, requireApiAuth } from "./middleware/auth";
import { logger } from "./lib/logger";
import { pool } from "./db";
import "./session.d";

const app: Express = express();

// Trust the first proxy hop so secure cookies work correctly behind a reverse proxy
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware — SESSION_SECRET must be set
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable must be set.");
}

const PgStore = connectPgSimple(session);

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "session",
      pruneSessionInterval: 60 * 60, // clean expired sessions every hour
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// EJS views — copied to dist/views during build.
// El motor se registra a mano: Express lo cargaría con un require dinámico que
// el bundle de esbuild no resuelve, y la imagen quedaría sin ejs en runtime.
app.engine("ejs", (ejs as unknown as { __express: Parameters<Express["engine"]>[1] }).__express);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Auth routes (no auth required)
app.use("/", authRouter);

// Health probe — public, no session required (liveness/readiness checks)
app.use("/api", healthRouter);

// Admin panel routes (auth required)
app.use("/orders", requireAuth, ordersRouter);
app.use("/clients", requireAuth, clientsRouter);
app.use("/products", requireAuth, productsRouter);
app.use("/stock", requireAuth, stockRouter);
app.use("/cuentas", requireAuth, cuentasRouter);

// Root redirect
app.get("/", requireAuth, (_req, res) => {
  res.redirect("/orders");
});

// Remaining API routes require auth
// La API la usan el panel (con sesión) y el agente de WhatsApp (con API key).
app.use("/api", requireApiAuth, router);

export default app;
