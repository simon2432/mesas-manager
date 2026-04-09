import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";

export const create = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const getById = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const close = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});
