import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  createLayoutBodySchema,
  layoutIdParamSchema,
  setLayoutTablesBodySchema,
  updateLayoutBodySchema,
} from "./layouts.schemas";
import * as layoutsService from "./layouts.service";

function parseLayoutId(req: Request, res: Response): number | null {
  const parsed = layoutIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid id" });
    return null;
  }
  return parsed.data.id;
}

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const layouts = await layoutsService.getAllLayouts();
  res.status(200).json({ layouts });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseLayoutId(req, res);
  if (id === null) return;

  const layout = await layoutsService.getLayoutById(id);
  res.status(200).json({ layout });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createLayoutBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const layout = await layoutsService.createLayout(parsed.data);
  res.status(201).json({ layout });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseLayoutId(req, res);
  if (id === null) return;

  const parsed = updateLayoutBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const layout = await layoutsService.updateLayout(id, parsed.data);
  res.status(200).json({ layout });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseLayoutId(req, res);
  if (id === null) return;

  await layoutsService.deleteLayout(id);
  res.status(204).end();
});

export const setTables = asyncHandler(async (req: Request, res: Response) => {
  const id = parseLayoutId(req, res);
  if (id === null) return;

  const parsed = setLayoutTablesBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const layout = await layoutsService.setLayoutTables(id, parsed.data);
  res.status(200).json({ layout });
});
