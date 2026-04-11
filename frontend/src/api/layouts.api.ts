import { api } from "@/src/api/client";

export type LayoutTableSummary = {
  id: number;
  number: number;
  capacity: number;
  status: string;
  isActive: boolean;
};

export type PublicLayout = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  tables: LayoutTableSummary[];
};

export async function fetchLayouts(): Promise<PublicLayout[]> {
  const { data } = await api.get<{ layouts: PublicLayout[] }>("/layouts");
  return data.layouts;
}

export async function fetchLayoutById(layoutId: number): Promise<PublicLayout> {
  const { data } = await api.get<{ layout: PublicLayout }>(
    `/layouts/${layoutId}`,
  );
  return data.layout;
}

export async function createLayout(body: { name: string }): Promise<PublicLayout> {
  const { data } = await api.post<{ layout: PublicLayout }>("/layouts", body);
  return data.layout;
}

export async function updateLayout(
  layoutId: number,
  body: { name: string },
): Promise<PublicLayout> {
  const { data } = await api.patch<{ layout: PublicLayout }>(
    `/layouts/${layoutId}`,
    body,
  );
  return data.layout;
}

export async function deleteLayout(layoutId: number): Promise<void> {
  await api.delete(`/layouts/${layoutId}`);
}

export async function setLayoutTables(
  layoutId: number,
  body: { tableIds: number[] },
): Promise<PublicLayout> {
  const { data } = await api.post<{ layout: PublicLayout }>(
    `/layouts/${layoutId}/tables`,
    body,
  );
  return data.layout;
}
