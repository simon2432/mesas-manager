import { Router } from "express";

import * as tablesController from "./tables.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "tables route ok" });
});

router.post("/", tablesController.create);
router.get("/:id/current-session", tablesController.getCurrentSession);
router.get("/:id", tablesController.getById);
router.put("/:id", tablesController.update);

export default router;
