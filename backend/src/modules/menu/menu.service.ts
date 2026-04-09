import { prisma } from "../../lib/prisma";
import { conflict, notFound } from "../../utils/httpError";
import type { CreateMenuItemBody, UpdateMenuItemBody } from "./menu.schemas";

const menuItemPublicSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type MenuItemRow = {
  id: number;
  name: string;
  description: string | null;
  price: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicMenuItem(row: MenuItemRow): PublicMenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllMenuItems(): Promise<PublicMenuItem[]> {
  const rows = await prisma.menuItem.findMany({
    select: menuItemPublicSelect,
    orderBy: { name: "asc" },
  });
  return rows.map(toPublicMenuItem);
}

export async function getMenuItemById(id: number): Promise<PublicMenuItem> {
  const row = await prisma.menuItem.findUnique({
    where: { id },
    select: menuItemPublicSelect,
  });
  if (!row) {
    throw notFound("Menu item not found");
  }
  return toPublicMenuItem(row);
}

export async function createMenuItem(
  data: CreateMenuItemBody,
): Promise<PublicMenuItem> {
  const name = data.name.trim();
  const existing = await prisma.menuItem.findFirst({
    where: { name },
  });
  if (existing) {
    throw conflict("A menu item with this name already exists");
  }

  const description =
    data.description !== undefined && data.description.trim() !== ""
      ? data.description.trim()
      : null;

  const row = await prisma.menuItem.create({
    data: {
      name,
      price: data.price,
      description,
      isActive: true,
    },
    select: menuItemPublicSelect,
  });

  return toPublicMenuItem(row);
}

export async function updateMenuItem(
  id: number,
  data: UpdateMenuItemBody,
): Promise<PublicMenuItem> {
  await getMenuItemById(id);

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    const duplicate = await prisma.menuItem.findFirst({
      where: {
        name: trimmed,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw conflict("A menu item with this name already exists");
    }
  }

  const updatePayload: {
    name?: string;
    price?: number;
    description?: string | null;
  } = {};

  if (data.name !== undefined) {
    updatePayload.name = data.name.trim();
  }
  if (data.price !== undefined) {
    updatePayload.price = data.price;
  }
  if (data.description !== undefined) {
    updatePayload.description =
      data.description === null
        ? null
        : data.description.trim() === ""
          ? null
          : data.description.trim();
  }

  const row = await prisma.menuItem.update({
    where: { id },
    data: updatePayload,
    select: menuItemPublicSelect,
  });

  return toPublicMenuItem(row);
}

export async function toggleMenuItemActive(id: number): Promise<PublicMenuItem> {
  const item = await getMenuItemById(id);
  const row = await prisma.menuItem.update({
    where: { id },
    data: { isActive: !item.isActive },
    select: menuItemPublicSelect,
  });
  return toPublicMenuItem(row);
}
