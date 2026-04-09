import { Router } from "express";

import * as historyController from "./history.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "history route ok" });
});

router.get("/daily", historyController.daily);

export default router;
