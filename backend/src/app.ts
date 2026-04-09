import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { registerRoutes } from "./routes/index";

export function createApp(): express.Express {
  const app = express();

  app.use(env.CLIENT_URL ? cors({ origin: env.CLIENT_URL }) : cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, message: "API running" });
  });

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
