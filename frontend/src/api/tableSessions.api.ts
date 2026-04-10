import { api } from "@/src/api/client";

export type OpenSessionBody = {
  tableId: number;
  waiterId: number;
  guestCount: number;
};

export type PublicOpenSession = {
  id: number;
  tableId: number;
  waiterId: number;
  guestCount: number;
  openedAt: string;
  closedAt: string | null;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  waiter: { id: number; name: string; isActive: boolean };
};

export type SessionItemPublic = {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  note: string | null;
  lineTotal: number;
};

export type AddSessionItemBody = {
  menuItemId: number;
  quantity: number;
  note?: string;
};

export type UpdateSessionItemBody = {
  quantity?: number;
  note?: string | null;
};

export type CloseSessionSummary = {
  total: number;
  guestCount: number;
  items: SessionItemPublic[];
};

export async function openTableSession(
  body: OpenSessionBody,
): Promise<PublicOpenSession> {
  const { data } = await api.post<{ session: PublicOpenSession }>(
    "/table-sessions/open",
    body,
  );
  return data.session;
}

export async function addSessionItem(
  sessionId: number,
  body: AddSessionItemBody,
): Promise<{ session: { id: number; total: number }; item: SessionItemPublic }> {
  const { data } = await api.post<{
    session: { id: number; total: number };
    item: SessionItemPublic;
  }>(`/table-sessions/${sessionId}/items`, body);
  return data;
}

export async function updateSessionItem(
  sessionId: number,
  itemId: number,
  body: UpdateSessionItemBody,
): Promise<{ session: { id: number; total: number }; item: SessionItemPublic }> {
  const { data } = await api.patch<{
    session: { id: number; total: number };
    item: SessionItemPublic;
  }>(`/table-sessions/${sessionId}/items/${itemId}`, body);
  return data;
}

export async function deleteSessionItem(
  sessionId: number,
  itemId: number,
): Promise<{ session: { id: number; total: number } }> {
  const { data } = await api.delete<{ session: { id: number; total: number } }>(
    `/table-sessions/${sessionId}/items/${itemId}`,
  );
  return data;
}

export async function closeTableSession(
  sessionId: number,
): Promise<CloseSessionSummary> {
  const { data } = await api.post<CloseSessionSummary>(
    `/table-sessions/${sessionId}/close`,
    {},
  );
  return data;
}
