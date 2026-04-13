import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
import {
  getLocalDayBoundsForYmd,
  inclusiveCalendarDayCount,
} from "../../utils/localDayBounds";

async function sumItemsSoldInLocalCalendarWindow(
  start: Date,
  end: Date,
): Promise<number> {
  const [fromClosedTickets, fromOpenSessions] = await Promise.all([
    prisma.sessionItem.aggregate({
      where: {
        tableSession: {
          status: SESSION_STATUS.CLOSED,
          closedAt: { gte: start, lte: end },
        },
      },
      _sum: { quantity: true },
    }),
    prisma.sessionItem.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        tableSession: { status: SESSION_STATUS.OPEN },
      },
      _sum: { quantity: true },
    }),
  ]);
  return (
    (fromClosedTickets._sum.quantity ?? 0) +
    (fromOpenSessions._sum.quantity ?? 0)
  );
}
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

  const [totalTables, itemsSoldCount, revenueAgg, peopleAgg, sessionsOpened] =
    await Promise.all([
      prisma.restaurantTable.count({ where: { isActive: true } }),
      sumItemsSoldInLocalCalendarWindow(start, end),
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
    itemsSold: itemsSoldCount,
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

  const itemsSoldPromise = sumItemsSoldInLocalCalendarWindow(start, end);

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

    const [totalTables, itemsSoldToday, revenueAgg, peopleOpenedAgg] =
      await Promise.all([
        prisma.restaurantTable.count({ where: { isActive: true } }),
        itemsSoldPromise,
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
      itemsSoldToday,
      revenueToday: Number(revenueAgg._sum.total ?? 0),
    };
  }

  const [
    totalTables,
    activeTables,
    freeTables,
    activeSessions,
    seatedAgg,
    itemsSoldToday,
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
    itemsSoldPromise,
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
    itemsSoldToday,
    revenueToday: Number(revenueAgg._sum.total ?? 0),
  };
}
