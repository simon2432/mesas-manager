import type { Request } from "express";
import { z } from "zod";

/** Express puede entregar `date` como string o como array (p. ej. query repetida). */
export function firstQueryString(
  req: Request,
  key: string,
): string | undefined {
  const raw = req.query[key];
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    const first = raw[0];
    return typeof first === "string" ? first : undefined;
  }
  return typeof raw === "string" ? raw : undefined;
}

export function optionalDateInputFromRequest(req: Request): { date?: string } {
  const date = firstQueryString(req, "date");
  return date === undefined ? {} : { date };
}

export const optionalLocalYmdQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export function parseOptionalLocalYmdFromRequest(req: Request) {
  return optionalLocalYmdQuerySchema.safeParse(
    optionalDateInputFromRequest(req),
  );
}

export const dashboardRangeQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export function parseDashboardRangeFromRequest(req: Request) {
  return dashboardRangeQuerySchema.safeParse({
    from: firstQueryString(req, "from"),
    to: firstQueryString(req, "to"),
  });
}
