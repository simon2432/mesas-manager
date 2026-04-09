import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  createMenuItemBodySchema,
  menuItemIdParamSchema,
  updateMenuItemBodySchema,
} from "./menu.schemas";
import * as menuService from "./menu.service";

function parseParamsId(req: Request, res: Response): number | null {
  const parsed = menuItemIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid id" });
    return null;
  }
  return parsed.data.id;
}

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const items = await menuService.getAllMenuItems();
  res.status(200).json({ items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const item = await menuService.getMenuItemById(id);
  res.status(200).json({ item });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createMenuItemBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const item = await menuService.createMenuItem(parsed.data);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const parsed = updateMenuItemBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const item = await menuService.updateMenuItem(id, parsed.data);
  res.status(200).json({ item });
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const item = await menuService.toggleMenuItemActive(id);
  res.status(200).json({ item });
});
