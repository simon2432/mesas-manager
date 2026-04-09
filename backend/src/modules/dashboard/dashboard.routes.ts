import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/summary", dashboardController.summary);

export default router;
