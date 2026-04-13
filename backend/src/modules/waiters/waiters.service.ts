import { prisma } from "../../lib/prisma";
import { badRequest, conflict, notFound } from "../../utils/httpError";
import type { CreateWaiterBody, UpdateWaiterBody } from "./waiters.schemas";

const waiterPublicSelect = {
  id: true,
  name: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicWaiter = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllWaiters(): Promise<PublicWaiter[]> {
  return prisma.waiter.findMany({
    select: waiterPublicSelect,
    orderBy: { name: "asc" },
  });
}

export async function getWaiterById(id: number): Promise<PublicWaiter> {
  const waiter = await prisma.waiter.findUnique({
    where: { id },
    select: waiterPublicSelect,
  });
  if (!waiter) {
    throw notFound("Mesero no encontrado");
  }
  return waiter;
}

export async function createWaiter(
  data: CreateWaiterBody,
): Promise<PublicWaiter> {
  const name = data.name.trim();
  const existing = await prisma.waiter.findFirst({
    where: { name },
  });
  if (existing) {
    throw conflict("Ya existe un mesero con ese nombre");
  }

  return prisma.waiter.create({
    data: {
      name,
      isActive: true,
    },
    select: waiterPublicSelect,
  });
}

export async function updateWaiter(
  id: number,
  data: UpdateWaiterBody,
): Promise<PublicWaiter> {
  if (data.name === undefined) {
    throw badRequest("No hay campos para actualizar");
  }

  const name = data.name.trim();
  await getWaiterById(id);

  const duplicate = await prisma.waiter.findFirst({
    where: {
      name,
      NOT: { id },
    },
  });
  if (duplicate) {
    throw conflict("Ya existe un mesero con ese nombre");
  }

  return prisma.waiter.update({
    where: { id },
    data: { name },
    select: waiterPublicSelect,
  });
}

export async function toggleWaiterActive(id: number): Promise<PublicWaiter> {
  const waiter = await getWaiterById(id);
  return prisma.waiter.update({
    where: { id },
    data: { isActive: !waiter.isActive },
    select: waiterPublicSelect,
  });
}
