import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
import { getLocalDayBounds } from "../../utils/localDayBounds";

export type DashboardSummary = {
  totalTables: number;
  activeTables: number;
  freeTables: number;
  activeSessions: number;
  peopleSeated: number;
  itemsSoldToday: number;
  revenueToday: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { start, end } = getLocalDayBounds();

  const [
    totalTables,
    activeTables,
    freeTables,
    activeSessions,
    seatedAgg,
    itemsAgg,
    revenueAgg,
  ] = await Promise.all([
    prisma.restaurantTable.count({ where: { isActive: true } }),
    prisma.restaurantTable.count({
      where: { isActive: true, status: TABLE_STATUS.OCCUPIED },
    }),
    prisma.restaurantTable.count({
      where: { isActive: true, status: TABLE_STATUS.FREE },
    }),
    prisma.tableSession.count({
      where: { status: SESSION_STATUS.OPEN },
    }),
    prisma.tableSession.aggregate({
      where: { status: SESSION_STATUS.OPEN },
      _sum: { guestCount: true },
    }),
    prisma.sessionItem.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: { quantity: true },
    }),
    prisma.tableSession.aggregate({
      where: {
        openedAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    totalTables,
    activeTables,
    freeTables,
    activeSessions,
    peopleSeated: seatedAgg._sum.guestCount ?? 0,
    itemsSoldToday: itemsAgg._sum.quantity ?? 0,
    revenueToday: Number(revenueAgg._sum.total ?? 0),
  };
}
