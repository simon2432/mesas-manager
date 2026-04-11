import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
import {
  getLocalDayBoundsForYmd,
  inclusiveCalendarDayCount,
} from "../../utils/localDayBounds";
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

export async function getDashboardRangeSummary(
  fromYmd: string,
  toYmd: string,
): Promise<DashboardRangeSummary> {
  const { start } = getLocalDayBoundsForYmd(fromYmd);
  const { end } = getLocalDayBoundsForYmd(toYmd);

  const [totalTables, itemsAgg, revenueAgg, peopleAgg, sessionsOpened] =
    await Promise.all([
      prisma.restaurantTable.count({ where: { isActive: true } }),
      prisma.sessionItem.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { quantity: true },
      }),
      prisma.tableSession.aggregate({
        where: { openedAt: { gte: start, lte: end } },
        _sum: { total: true },
      }),
      prisma.tableSession.aggregate({
        where: { openedAt: { gte: start, lte: end } },
        _sum: { guestCount: true },
      }),
      prisma.tableSession.count({
        where: { openedAt: { gte: start, lte: end } },
      }),
    ]);

  return {
    from: fromYmd,
    to: toYmd,
    dayCountInclusive: inclusiveCalendarDayCount(fromYmd, toYmd),
    totalTables,
    sessionsOpened,
    totalPeople: peopleAgg._sum.guestCount ?? 0,
    itemsSold: itemsAgg._sum.quantity ?? 0,
    revenue: Number(revenueAgg._sum.total ?? 0),
  };
}

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
