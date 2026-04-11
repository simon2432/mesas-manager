import type { Request, Response } from "express";

import {
  dashboardRangeQuerySchema,
  optionalLocalYmdQuerySchema,
} from "../../schemas/dateQuery";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getLocalServerTodayYmd,
  inclusiveCalendarDayCount,
  resolveLocalDayBounds,
} from "../../utils/localDayBounds";
import * as dashboardService from "./dashboard.service";

const MAX_RANGE_DAYS = 366;

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

export const summaryRange = asyncHandler(async (req: Request, res: Response) => {
  const parsed = dashboardRangeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Consulta inválida" });
    return;
  }

  const { from, to } = parsed.data;
  const todayYmd = getLocalServerTodayYmd();

  if (from > to) {
    res.status(400).json({
      message: "La fecha «desde» no puede ser posterior a «hasta».",
    });
    return;
  }
  if (from > todayYmd || to > todayYmd) {
    res.status(400).json({
      message: "No se pueden incluir fechas futuras.",
    });
    return;
  }

  let daySpan: number;
  try {
    daySpan = inclusiveCalendarDayCount(from, to);
  } catch {
    res.status(400).json({ message: "Fecha inválida" });
    return;
  }

  if (daySpan > MAX_RANGE_DAYS) {
    res.status(400).json({
      message: `El período no puede superar ${MAX_RANGE_DAYS} días.`,
    });
    return;
  }

  const data = await dashboardService.getDashboardRangeSummary(from, to);
  res.status(200).json(data);
});
