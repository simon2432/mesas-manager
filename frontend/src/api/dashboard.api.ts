import { api } from "@/src/api/client";

export type DashboardSummary = {
  selectedDate: string;
  isSelectedDateToday: boolean;
  totalTables: number;
  activeTables: number | null;
  freeTables: number | null;
  activeSessions: number | null;
  peopleSeated: number | null;
  itemsSoldToday: number;
  revenueToday: number;
};

export async function fetchDashboardSummary(
  dateYmd: string,
): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary", {
    params: { date: dateYmd },
  });
  return data;
}
