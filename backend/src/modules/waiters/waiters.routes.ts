import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as waitersController from "./waiters.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", waitersController.getAll);
router.post("/", waitersController.create);
router.get("/:id", waitersController.getById);
router.patch("/:id/toggle-active", waitersController.toggleActive);
router.patch("/:id", waitersController.update);

export default router;
