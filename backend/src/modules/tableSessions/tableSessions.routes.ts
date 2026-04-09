import { Router } from "express";

import * as tableSessionsController from "./tableSessions.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "table-sessions route ok" });
});

router.post("/", tableSessionsController.create);
router.get("/:id", tableSessionsController.getById);
router.post("/:id/close", tableSessionsController.close);

export default router;
