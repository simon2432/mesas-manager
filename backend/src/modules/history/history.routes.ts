import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as historyController from "./history.controller";

const router = Router();

router.use(authMiddleware);

router.get("/daily", historyController.dailyList);
router.get("/daily/:id", historyController.dailyDetail);

export default router;
