import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  createWaiterBodySchema,
  updateWaiterBodySchema,
  waiterIdParamSchema,
} from "./waiters.schemas";
import * as waitersService from "./waiters.service";

function parseParamsId(req: Request, res: Response): number | null {
  const parsed = waiterIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res
      .status(400)
      .json({ message: first?.message ?? "Identificador inválido" });
    return null;
  }
  return parsed.data.id;
}

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const waiters = await waitersService.getAllWaiters();
  res.status(200).json({ waiters });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const waiter = await waitersService.getWaiterById(id);
  res.status(200).json({ waiter });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createWaiterBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const waiter = await waitersService.createWaiter(parsed.data);
  res.status(201).json({ waiter });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseParamsId(req, res);
  if (id === null) return;

  const parsed = updateWaiterBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const waiter = await waitersService.updateWaiter(id, parsed.data);
  res.status(200).json({ waiter });
});

export const toggleActive = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseParamsId(req, res);
    if (id === null) return;

    const waiter = await waitersService.toggleWaiterActive(id);
    res.status(200).json({ waiter });
  },
);
