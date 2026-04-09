import { prisma } from "../../lib/prisma";
import { SESSION_STATUS } from "../../constants/tableFlow";
import { notFound } from "../../utils/httpError";
import { getLocalDayBounds } from "../../utils/localDayBounds";

export type DailyClosedSessionRow = {
  sessionId: number;
  tableNumber: number;
  waiterName: string;
  guestCount: number;
  openedAt: Date;
  closedAt: Date;
  total: number;
};

export type DailyClosedSessionDetail = DailyClosedSessionRow & {
  items: Array<{
    id: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    note: string | null;
    lineTotal: number;
  }>;
};

function closedTodayWhere(start: Date, end: Date) {
  return {
    status: SESSION_STATUS.CLOSED,
    closedAt: {
      gte: start,
      lte: end,
    } as const,
  };
}

export async function getDailyClosedSessions(): Promise<DailyClosedSessionRow[]> {
  const { start, end } = getLocalDayBounds();

  const rows = await prisma.tableSession.findMany({
    where: closedTodayWhere(start, end),
    orderBy: { closedAt: "desc" },
    include: {
      table: { select: { number: true } },
      waiter: { select: { name: true } },
    },
  });

  return rows.map((s) => ({
    sessionId: s.id,
    tableNumber: s.table.number,
    waiterName: s.waiter.name,
    guestCount: s.guestCount,
    openedAt: s.openedAt,
    closedAt: s.closedAt!,
    total: Number(s.total),
  }));
}

export async function getDailyClosedSessionDetail(
  sessionId: number,
): Promise<DailyClosedSessionDetail> {
  const { start, end } = getLocalDayBounds();

  const session = await prisma.tableSession.findFirst({
    where: {
      id: sessionId,
      ...closedTodayWhere(start, end),
    },
    include: {
      table: { select: { number: true } },
      waiter: { select: { name: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  if (!session || !session.closedAt) {
    throw notFound("Closed session not found for today");
  }

  const items = session.items.map((i) => {
    const unitPrice = Number(i.unitPrice);
    return {
      id: i.id,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice,
      productName: i.productName,
      note: i.note,
      lineTotal: unitPrice * i.quantity,
    };
  });

  return {
    sessionId: session.id,
    tableNumber: session.table.number,
    waiterName: session.waiter.name,
    guestCount: session.guestCount,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
    total: Number(session.total),
    items,
  };
}
