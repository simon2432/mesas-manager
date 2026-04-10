import { api } from "@/src/api/client";

export type DashboardSummary = {
  totalTables: number;
  activeTables: number;
  freeTables: number;
  activeSessions: number;
  peopleSeated: number;
  itemsSoldToday: number;
  revenueToday: number;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}
