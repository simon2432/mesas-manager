import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { historySessionIdParamSchema } from "./history.schemas";
import * as historyService from "./history.service";

export const dailyList = asyncHandler(async (_req: Request, res: Response) => {
  const sessions = await historyService.getDailyClosedSessions();
  res.status(200).json(sessions);
});

export const dailyDetail = asyncHandler(async (req: Request, res: Response) => {
  const parsed = historySessionIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid id" });
    return;
  }

  const session = await historyService.getDailyClosedSessionDetail(
    parsed.data.id,
  );
  res.status(200).json({ session });
});
