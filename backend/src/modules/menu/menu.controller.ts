import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";

export const listCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
  },
);

export const createCategory = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
  },
);

export const updateCategory = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
  },
);

export const listItems = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const getItemById = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const createItem = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const updateItem = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

export const toggleItemActive = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
  },
);
