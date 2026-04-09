import type { Express } from "express";

import authRoutes from "../modules/auth/auth.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import historyRoutes from "../modules/history/history.routes";
import layoutsRoutes from "../modules/layouts/layouts.routes";
import menuRoutes from "../modules/menu/menu.routes";
import tableSessionsRoutes from "../modules/tableSessions/tableSessions.routes";
import tablesRoutes from "../modules/tables/tables.routes";
import waitersRoutes from "../modules/waiters/waiters.routes";

/** Recursos REST bajo `/api`. Operacional: `GET /health` queda fuera (ver `app.ts`). */
export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/waiters", waitersRoutes);
  app.use("/api/tables", tablesRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/table-sessions", tableSessionsRoutes);
  app.use("/api/layouts", layoutsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/history", historyRoutes);
}
