import bcrypt from "bcrypt";

import { prisma } from "../../lib/prisma";
import { conflict, notFound, unauthorized } from "../../utils/httpError";
import type { ChangeMyPasswordBody, CreateUserBody } from "./users.schemas";

const BCRYPT_ROUNDS = 10;

const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicUserRecord = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createUser(
  data: CreateUserBody,
): Promise<PublicUserRecord> {
  const email = data.email.toLowerCase().trim();
  const name = data.name.trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw conflict("Ya existe un usuario con ese correo");
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: userPublicSelect,
  });
}

export async function changeMyPassword(
  userId: number,
  data: ChangeMyPasswordBody,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw notFound("Usuario no encontrado");
  }

  const currentOk = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );
  if (!currentOk) {
    throw unauthorized("La contraseña actual no es correcta");
  }

  const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}
