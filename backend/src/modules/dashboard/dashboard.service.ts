import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
export type DashboardSummary = {
  selectedDate: string;
  isSelectedDateToday: boolean;
  totalTables: number;
  /** Solo tiene sentido para el día actual del servidor; en días pasados/futuros es `null`. */
  activeTables: number | null;
  freeTables: number | null;
  activeSessions: number | null;
  peopleSeated: number | null;
  /**
   * Suma de comensales (`guestCount`) en sesiones que abrieron en la fecha elegida.
   * Solo se informa cuando el día elegido no es el actual; en el día actual es `null` (ver `peopleSeated`).
   */
  totalPeopleThatDay: number | null;
  itemsSoldToday: number;
  revenueToday: number;
};

export async function getDashboardSummary(input: {
  start: Date;
  end: Date;
  ymd: string;
  isSelectedDateToday: boolean;
}): Promise<DashboardSummary> {
  const { start, end, ymd, isSelectedDateToday } = input;

  const itemsAggPromise = prisma.sessionItem.aggregate({
    where: {
      createdAt: { gte: start, lte: end },
    },
    _sum: { quantity: true },
  });

  const revenueAggPromise = prisma.tableSession.aggregate({
    where: {
      openedAt: { gte: start, lte: end },
    },
    _sum: { total: true },
  });

  if (!isSelectedDateToday) {
    const peopleOpenedThatDayPromise = prisma.tableSession.aggregate({
      where: {
        openedAt: { gte: start, lte: end },
      },
      _sum: { guestCount: true },
    });

    const [totalTables, itemsAgg, revenueAgg, peopleOpenedAgg] =
      await Promise.all([
        prisma.restaurantTable.count({ where: { isActive: true } }),
        itemsAggPromise,
        revenueAggPromise,
        peopleOpenedThatDayPromise,
      ]);

    return {
      selectedDate: ymd,
      isSelectedDateToday: false,
      totalTables,
      activeTables: null,
      freeTables: null,
      activeSessions: null,
      peopleSeated: null,
      totalPeopleThatDay: peopleOpenedAgg._sum.guestCount ?? 0,
      itemsSoldToday: itemsAgg._sum.quantity ?? 0,
      revenueToday: Number(revenueAgg._sum.total ?? 0),
    };
  }

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
    itemsAggPromise,
    revenueAggPromise,
  ]);

  return {
    selectedDate: ymd,
    isSelectedDateToday: true,
    totalTables,
    activeTables,
    freeTables,
    activeSessions,
    peopleSeated: seatedAgg._sum.guestCount ?? 0,
    totalPeopleThatDay: null,
    itemsSoldToday: itemsAgg._sum.quantity ?? 0,
    revenueToday: Number(revenueAgg._sum.total ?? 0),
  };
}
