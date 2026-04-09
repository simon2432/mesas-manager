import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const getById = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const create = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const update = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const remove = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const addTable = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});
