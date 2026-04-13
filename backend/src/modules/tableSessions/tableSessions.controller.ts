import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  addSessionItemBodySchema,
  openSessionBodySchema,
  sessionIdParamSchema,
  sessionItemParamsSchema,
  updateOpenSessionBodySchema,
  updateSessionItemBodySchema,
} from "./tableSessions.schemas";
import * as tableSessionsService from "./tableSessions.service";

function parseSessionId(req: Request, res: Response): number | null {
  const parsed = sessionIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res
      .status(400)
      .json({ message: first?.message ?? "Identificador inválido" });
    return null;
  }
  return parsed.data.id;
}

function parseSessionItemParams(
  req: Request,
  res: Response,
): { sessionId: number; itemId: number } | null {
  const parsed = sessionItemParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Parámetros inválidos" });
    return null;
  }
  return { sessionId: parsed.data.id, itemId: parsed.data.itemId };
}

export const open = asyncHandler(async (req: Request, res: Response) => {
  const parsed = openSessionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const session = await tableSessionsService.openSession(parsed.data);
  res.status(201).json({ session });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const id = parseSessionId(req, res);
  if (id === null) return;

  const parsed = addSessionItemBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const result = await tableSessionsService.addSessionItem(id, parsed.data);
  res.status(201).json(result);
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const params = parseSessionItemParams(req, res);
  if (params === null) return;

  const parsed = updateSessionItemBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const result = await tableSessionsService.updateSessionItem(
    params.sessionId,
    params.itemId,
    parsed.data,
  );
  res.status(200).json(result);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const params = parseSessionItemParams(req, res);
  if (params === null) return;

  const result = await tableSessionsService.deleteSessionItem(
    params.sessionId,
    params.itemId,
  );
  res.status(200).json(result);
});

export const updateMeta = asyncHandler(async (req: Request, res: Response) => {
  const id = parseSessionId(req, res);
  if (id === null) return;

  const parsed = updateOpenSessionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const session = await tableSessionsService.updateOpenSessionMeta(
    id,
    parsed.data,
  );
  res.status(200).json({ session });
});

export const close = asyncHandler(async (req: Request, res: Response) => {
  const id = parseSessionId(req, res);
  if (id === null) return;

  const summary = await tableSessionsService.closeSession(id);
  res.status(200).json(summary);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseSessionId(req, res);
  if (id === null) return;

  const session = await tableSessionsService.getSessionById(id);
  res.status(200).json({ session });
});
