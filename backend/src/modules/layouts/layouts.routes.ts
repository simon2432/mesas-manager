import { Router } from "express";

import * as layoutsController from "./layouts.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "layouts route ok" });
});

router.post("/", layoutsController.create);
router.get("/:id", layoutsController.getById);
router.put("/:id", layoutsController.update);
router.delete("/:id", layoutsController.remove);
router.post("/:id/tables", layoutsController.addTable);

export default router;
