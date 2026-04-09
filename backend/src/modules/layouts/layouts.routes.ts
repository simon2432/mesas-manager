import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as layoutsController from "./layouts.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", layoutsController.list);
router.post("/", layoutsController.create);
router.get("/:id", layoutsController.getById);
router.patch("/:id", layoutsController.update);
router.delete("/:id", layoutsController.remove);
router.post("/:id/tables", layoutsController.setTables);

export default router;
