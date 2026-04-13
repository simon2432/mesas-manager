import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
import { badRequest, conflict, notFound } from "../../utils/httpError";
import type { CreateTableBody, UpdateTableBody } from "./tables.schemas";

const tablePublicSelect = {
  id: true,
  number: true,
  capacity: true,
  status: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicTable = {
  id: number;
  number: number;
  capacity: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Solo en `getAllTables`: mozo de la sesión abierta, si la mesa está ocupada. */
  activeWaiterName?: string | null;
  /** Solo en `getAllTables`: comensales de la sesión abierta (para validar capacidad al editar). */
  openSessionGuestCount?: number | null;
};

export async function getAllTables(): Promise<PublicTable[]> {
  const rows = await prisma.restaurantTable.findMany({
    select: {
      ...tablePublicSelect,
      sessions: {
        where: { status: SESSION_STATUS.OPEN },
        take: 1,
        select: {
          guestCount: true,
          waiter: { select: { name: true } },
        },
      },
    },
    orderBy: { number: "asc" },
  });

  return rows.map((r) => {
    const { sessions, ...rest } = r;
    return {
      ...rest,
      activeWaiterName: sessions[0]?.waiter?.name ?? null,
      openSessionGuestCount: sessions[0]?.guestCount ?? null,
    };
  });
}

export async function getTableById(id: number): Promise<PublicTable> {
  const table = await prisma.restaurantTable.findUnique({
    where: { id },
    select: tablePublicSelect,
  });
  if (!table) {
    throw notFound("Mesa no encontrada");
  }
  return table;
}

export async function createTable(data: CreateTableBody): Promise<PublicTable> {
  const existing = await prisma.restaurantTable.findFirst({
    where: { number: data.number },
  });
  if (existing) {
    throw conflict("Ya existe una mesa con ese número");
  }

  return prisma.restaurantTable.create({
    data: {
      number: data.number,
      capacity: data.capacity,
      status: TABLE_STATUS.FREE,
      isActive: true,
    },
    select: tablePublicSelect,
  });
}

export async function updateTable(
  id: number,
  data: UpdateTableBody,
): Promise<PublicTable> {
  const current = await getTableById(id);

  if (data.number !== undefined && data.number !== current.number) {
    const duplicate = await prisma.restaurantTable.findFirst({
      where: {
        number: data.number,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw conflict("Ya existe una mesa con ese número");
    }
  }

  if (data.capacity !== undefined) {
    const openSession = await prisma.tableSession.findFirst({
      where: { tableId: id, status: SESSION_STATUS.OPEN },
      select: { guestCount: true },
    });
    if (openSession && data.capacity < openSession.guestCount) {
      throw badRequest(
        `La capacidad no puede ser menor que los comensales de la sesión abierta (${openSession.guestCount}).`,
      );
    }
  }

  return prisma.restaurantTable.update({
    where: { id },
    data: {
      ...(data.number !== undefined ? { number: data.number } : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
    },
    select: tablePublicSelect,
  });
}

export async function toggleTableActive(id: number): Promise<PublicTable> {
  const table = await prisma.restaurantTable.findUnique({
    where: { id },
    select: tablePublicSelect,
  });
  if (!table) {
    throw notFound("Mesa no encontrada");
  }

  if (table.isActive) {
    if (table.status === TABLE_STATUS.OCCUPIED) {
      throw conflict("No se puede desactivar una mesa con sesión abierta");
    }
    return prisma.restaurantTable.update({
      where: { id },
      data: { isActive: false },
      select: tablePublicSelect,
    });
  }

  return prisma.restaurantTable.update({
    where: { id },
    data: { isActive: true },
    select: tablePublicSelect,
  });
}

export type TableCurrentDetail = {
  table: PublicTable;
  openSession: null | {
    id: number;
    tableId: number;
    waiterId: number;
    guestCount: number;
    openedAt: Date;
    status: string;
    total: number;
    waiter: { id: number; name: string; isActive: boolean };
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
};

export async function getTableCurrentDetail(
  tableId: number,
): Promise<TableCurrentDetail> {
  const table = await getTableById(tableId);

  const session = await prisma.tableSession.findFirst({
    where: { tableId, status: SESSION_STATUS.OPEN },
    include: {
      waiter: { select: { id: true, name: true, isActive: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  if (table.status === TABLE_STATUS.FREE) {
    if (session) {
      throw badRequest(
        "Inconsistencia: la mesa figura libre pero tiene una sesión abierta",
      );
    }
    return { table, openSession: null };
  }

  if (!session) {
    throw badRequest(
      "Inconsistencia: la mesa figura ocupada pero no tiene sesión abierta",
    );
  }

  const items = session.items.map((i) => {
    const unitPrice = Number(i.unitPrice);
    const lineTotal = unitPrice * i.quantity;
    return {
      id: i.id,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice,
      productName: i.productName,
      note: i.note,
      lineTotal,
    };
  });

  return {
    table,
    openSession: {
      id: session.id,
      tableId: session.tableId,
      waiterId: session.waiterId,
      guestCount: session.guestCount,
      openedAt: session.openedAt,
      status: session.status,
      total: Number(session.total),
      waiter: session.waiter,
      items,
    },
  };
}
