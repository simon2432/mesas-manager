import { api } from "@/src/api/client";

export type DailyClosedSessionRow = {
  sessionId: number;
  tableNumber: number;
  waiterName: string;
  guestCount: number;
  openedAt: string;
  closedAt: string;
  total: number;
};

export type DailyClosedSessionDetail = DailyClosedSessionRow & {
  items: {
    id: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    note: string | null;
    lineTotal: number;
  }[];
};

export async function fetchDailyClosedSessions(
  dateYmd: string,
): Promise<DailyClosedSessionRow[]> {
  const { data } = await api.get<DailyClosedSessionRow[]>("/history/daily", {
    params: { date: dateYmd },
  });
  return data;
}

export async function fetchDailyClosedSessionDetail(
  sessionId: number,
  dateYmd: string,
): Promise<DailyClosedSessionDetail> {
  const { data } = await api.get<{ session: DailyClosedSessionDetail }>(
    `/history/daily/${sessionId}`,
    { params: { date: dateYmd } },
  );
  return data.session;
}
