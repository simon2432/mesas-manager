import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as tablesController from "./tables.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", tablesController.list);
router.post("/", tablesController.create);
router.get("/:id/current", tablesController.getCurrent);
router.patch("/:id/toggle-active", tablesController.toggleActive);
router.patch("/:id", tablesController.update);
router.get("/:id", tablesController.getById);

export default router;
