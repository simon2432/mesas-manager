import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  changeMyPasswordBodySchema,
  createUserBodySchema,
} from "./users.schemas";
import * as usersService from "./users.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUserBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Invalid request" });
    return;
  }

  const user = await usersService.createUser(parsed.data);
  res.status(201).json({ user });
});

export const changeMyPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const parsed = changeMyPasswordBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      res.status(400).json({ message: first?.message ?? "Invalid request" });
      return;
    }

    await usersService.changeMyPassword(userId, parsed.data);
    res.status(200).json({ message: "Password updated" });
  },
);
