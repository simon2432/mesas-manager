import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { getLocalServerTodayYmd } from "../../utils/localDayBounds";
import { loginBodySchema, registerBodySchema } from "./auth.schemas";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const { token, user } = await authService.register(parsed.data);
  res.status(201).json({
    message: "Registro exitoso",
    token,
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({ message: first?.message ?? "Solicitud inválida" });
    return;
  }

  const { email, password } = parsed.data;
  const { token, user } = await authService.login(email, password);

  res.status(200).json({
    message: "Sesión iniciada",
    token,
    user,
    serverTodayYmd: getLocalServerTodayYmd(),
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (userId === undefined) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const user = await authService.getCurrentUser(userId);
  res.status(200).json({
    user,
    serverTodayYmd: getLocalServerTodayYmd(),
  });
});
