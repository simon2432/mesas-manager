import { Router } from "express";

import { authMiddleware } from "../../middlewares/authMiddleware";
import * as usersController from "./users.controller";

const router = Router();

router.use(authMiddleware);

/** Debe ir antes de rutas dinámicas tipo /:id si se agregan después. */
router.patch("/me/password", usersController.changeMyPassword);
router.post("/", usersController.create);

export default router;
