import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as usersController from "./users.controller";

const router = Router();

router.use(authMiddleware);

router.patch("/me/password", usersController.changeMyPassword);
router.post("/", usersController.create);

export default router;
