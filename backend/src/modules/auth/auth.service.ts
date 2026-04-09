import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { unauthorized } from "../../utils/httpError";
import type { JwtUserPayload } from "./auth.schemas";

const JWT_EXPIRES_IN = "7d";

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: PublicUser }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw unauthorized();
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    throw unauthorized();
  }

  const payload: JwtUserPayload = { userId: user.id, email: user.email };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function getCurrentUser(userId: number): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw unauthorized();
  }

  return user;
}
