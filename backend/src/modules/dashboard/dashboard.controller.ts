import type { Request, Response } from "express";

import { optionalLocalYmdQuerySchema } from "../../schemas/dateQuery";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getLocalServerTodayYmd,
  resolveLocalDayBounds,
} from "../../utils/localDayBounds";
import * as dashboardService from "./dashboard.service";

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const parsed = optionalLocalYmdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid query" });
    return;
  }

  let bounds: { start: Date; end: Date; ymd: string };
  try {
    bounds = resolveLocalDayBounds(parsed.data.date);
  } catch {
    res.status(400).json({ message: "Fecha inválida" });
    return;
  }

  const isSelectedDateToday = bounds.ymd === getLocalServerTodayYmd();
  const data = await dashboardService.getDashboardSummary({
    start: bounds.start,
    end: bounds.end,
    ymd: bounds.ymd,
    isSelectedDateToday,
  });
  res.status(200).json(data);
});
