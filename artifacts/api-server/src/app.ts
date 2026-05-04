import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import path from "path";
import router from "./routes";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";
import clientsRouter from "./routes/clients";
import productsRouter from "./routes/products";
import { requireAuth } from "./middleware/auth";
import { logger } from "./lib/logger";

const app: Express = express();

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

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tupack-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
  }),
);

// EJS views — point to dist/views (copied there during build)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Auth routes (no auth required)
app.use("/", authRouter);

// Admin panel routes (auth required)
app.use("/orders", requireAuth, ordersRouter);
app.use("/clients", requireAuth, clientsRouter);
app.use("/products", requireAuth, productsRouter);

// Root redirect
app.get("/", requireAuth, (_req, res) => {
  res.redirect("/orders");
});

// Existing API routes
app.use("/api", router);

export default app;
