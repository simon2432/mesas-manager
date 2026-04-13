import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { JwtUserPayload } from "../modules/auth/auth.schemas";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
      Partial<JwtUserPayload>;

    const userId = decoded.userId;
    if (userId === undefined || userId === null) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const id = typeof userId === "number" ? userId : Number(userId);
    if (!Number.isFinite(id)) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    req.user =
      typeof decoded.email === "string" ? { id, email: decoded.email } : { id };
    next();
  } catch {
    res.status(401).json({ message: "Credenciales inválidas" });
  }
}
