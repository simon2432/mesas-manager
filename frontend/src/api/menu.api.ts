import { api } from "@/src/api/client";

export type PublicMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemBody = {
  name: string;
  price: number;
  description?: string;
};

export type UpdateMenuItemBody = {
  name?: string;
  price?: number;
  description?: string | null;
};

export async function fetchMenuItems(): Promise<PublicMenuItem[]> {
  const { data } = await api.get<{ items: PublicMenuItem[] }>("/menu");
  return data.items;
}

export async function createMenuItem(
  body: CreateMenuItemBody,
): Promise<PublicMenuItem> {
  const { data } = await api.post<PublicMenuItem>("/menu", body);
  return data;
}

export async function updateMenuItem(
  id: number,
  body: UpdateMenuItemBody,
): Promise<PublicMenuItem> {
  const { data } = await api.patch<{ item: PublicMenuItem }>(
    `/menu/${id}`,
    body,
  );
  return data.item;
}

export async function toggleMenuItemActive(
  id: number,
): Promise<PublicMenuItem> {
  const { data } = await api.patch<{ item: PublicMenuItem }>(
    `/menu/${id}/toggle-active`,
    {},
  );
  return data.item;
}
