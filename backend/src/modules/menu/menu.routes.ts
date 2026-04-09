import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as menuController from "./menu.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", menuController.getAll);
router.post("/", menuController.create);
router.get("/:id", menuController.getById);
router.patch("/:id/toggle-active", menuController.toggleActive);
router.patch("/:id", menuController.update);

export default router;
