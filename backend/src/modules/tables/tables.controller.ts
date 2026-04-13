import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  createTableBodySchema,
  tableIdParamSchema,
  updateTableBodySchema,
} from "./tables.schemas";
import * as tablesService from "./tables.service";

function parseParamsId(req: Request, res: Response): number | null {
  const parsed = tableIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res
      .status(400)
      .json({ message: first?.message ?? "Identificador inválido" });
    return null;
  }
  return parsed.data.id;
}

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const tables = await tablesService.getAllTables();
  res.status(200).json({ tables });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const table = await tablesService.getTableById(id);
  res.status(200).json({ table });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createTableBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const table = await tablesService.createTable(parsed.data);
  res.status(201).json({ table });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const parsed = updateTableBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const table = await tablesService.updateTable(id, parsed.data);
  res.status(200).json({ table });
});

export const toggleActive = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseParamsId(req, res);
    if (id === null) return;

    const table = await tablesService.toggleTableActive(id);
    res.status(200).json({ table });
  },
);

export const getCurrent = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const detail = await tablesService.getTableCurrentDetail(id);
  const totalAccumulated = detail.openSession?.total ?? 0;
  res.status(200).json({
    ...detail,
    totalAccumulated,
  });
});
