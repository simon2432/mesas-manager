import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});
