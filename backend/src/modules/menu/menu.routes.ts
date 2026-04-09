import { Router } from "express";

import * as menuController from "./menu.controller";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "menu route ok" });
});

router.get("/categories", menuController.listCategories);
router.post("/categories", menuController.createCategory);
router.put("/categories/:id", menuController.updateCategory);

router.get("/items", menuController.listItems);
router.get("/items/:id", menuController.getItemById);
router.post("/items", menuController.createItem);
router.put("/items/:id", menuController.updateItem);
router.patch("/items/:id/toggle-active", menuController.toggleItemActive);

export default router;
