import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as authController from "./auth.controller";

const router = Router();

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
