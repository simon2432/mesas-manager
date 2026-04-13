import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as tableSessionsController from "./tableSessions.controller";

const router = Router();

router.use(authMiddleware);

router.post("/open", tableSessionsController.open);
router.post("/:id/items", tableSessionsController.addItem);
router.patch("/:id/items/:itemId", tableSessionsController.updateItem);
router.delete("/:id/items/:itemId", tableSessionsController.removeItem);
router.post("/:id/close", tableSessionsController.close);
router.patch("/:id", tableSessionsController.updateMeta);
router.get("/:id", tableSessionsController.getById);

export default router;
