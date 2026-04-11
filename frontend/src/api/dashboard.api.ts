import { api } from "@/src/api/client";

export type DashboardSummary = {
  selectedDate: string;
  isSelectedDateToday: boolean;
  totalTables: number;
  activeTables: number | null;
  freeTables: number | null;
  activeSessions: number | null;
  peopleSeated: number | null;
  totalPeopleThatDay: number | null;
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

export type DashboardRangeSummary = {
  from: string;
  to: string;
  dayCountInclusive: number;
  totalTables: number;
  sessionsOpened: number;
  totalPeople: number;
  itemsSold: number;
  revenue: number;
};

export async function fetchDashboardRangeSummary(
  from: string,
  to: string,
): Promise<DashboardRangeSummary> {
  const { data } = await api.get<DashboardRangeSummary>(
    "/dashboard/summary-range",
    { params: { from, to } },
  );
  return data;
}
