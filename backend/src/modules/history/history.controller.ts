import type { Request, Response } from "express";

import { optionalLocalYmdQuerySchema } from "../../schemas/dateQuery";
import { asyncHandler } from "../../utils/asyncHandler";
import { resolveLocalDayBounds } from "../../utils/localDayBounds";
import { historySessionIdParamSchema } from "./history.schemas";
import * as historyService from "./history.service";

export const dailyList = asyncHandler(async (req: Request, res: Response) => {
  const parsed = optionalLocalYmdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid query" });
    return;
  }

  let bounds: { start: Date; end: Date };
  try {
    bounds = resolveLocalDayBounds(parsed.data.date);
  } catch {
    res.status(400).json({ message: "Fecha inválida" });
    return;
  }

  const sessions = await historyService.getDailyClosedSessions(
    bounds.start,
    bounds.end,
  );
  res.status(200).json(sessions);
});

export const dailyDetail = asyncHandler(async (req: Request, res: Response) => {
  const paramParsed = historySessionIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    const first = paramParsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid id" });
    return;
  }

  const queryParsed = optionalLocalYmdQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    const first = queryParsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid query" });
    return;
  }

  let bounds: { start: Date; end: Date };
  try {
    bounds = resolveLocalDayBounds(queryParsed.data.date);
  } catch {
    res.status(400).json({ message: "Fecha inválida" });
    return;
  }

  const session = await historyService.getDailyClosedSessionDetail(
    paramParsed.data.id,
    bounds.start,
    bounds.end,
  );
  res.status(200).json({ session });
});
