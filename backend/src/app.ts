import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { registerRoutes } from "./routes/index";

function buildCorsOrigin(): cors.CorsOptions["origin"] {
  if (env.NODE_ENV !== "production") {
    return (origin, callback) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    };
  }
  return env.CLIENT_URL || false;
}

export function createApp(): express.Express {
  const app = express();

  app.use(cors({ origin: buildCorsOrigin() }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, message: "OK" });
  });

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
