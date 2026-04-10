import { api } from "@/src/api/client";

export type PublicWaiter = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchWaiters(): Promise<PublicWaiter[]> {
  const { data } = await api.get<{ waiters: PublicWaiter[] }>("/waiters");
  return data.waiters;
}

export async function createWaiter(body: {
  name: string;
}): Promise<PublicWaiter> {
  const { data } = await api.post<{ waiter: PublicWaiter }>("/waiters", body);
  return data.waiter;
}

export async function updateWaiter(
  id: number,
  body: { name: string },
): Promise<PublicWaiter> {
  const { data } = await api.patch<{ waiter: PublicWaiter }>(
    `/waiters/${id}`,
    body,
  );
  return data.waiter;
}

export async function toggleWaiterActive(id: number): Promise<PublicWaiter> {
  const { data } = await api.patch<{ waiter: PublicWaiter }>(
    `/waiters/${id}/toggle-active`,
    {},
  );
  return data.waiter;
}
