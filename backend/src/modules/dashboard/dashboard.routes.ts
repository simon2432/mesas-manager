import { Router } from "express";

import * as dashboardController from "./dashboard.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "dashboard route ok" });
});

router.get("/summary", dashboardController.summary);

export default router;
