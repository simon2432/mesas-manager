import { prisma } from "../../lib/prisma";
import { SESSION_STATUS, TABLE_STATUS } from "../../constants/tableFlow";
import { badRequest, conflict, notFound } from "../../utils/httpError";
import type {
  AddSessionItemBody,
  OpenSessionBody,
  UpdateOpenSessionBody,
  UpdateSessionItemBody,
} from "./tableSessions.schemas";

type DbClient = Pick<typeof prisma, "sessionItem" | "tableSession">;

async function setSessionTotalFromItems(
  tx: DbClient,
  sessionId: number,
): Promise<number> {
  const items = await tx.sessionItem.findMany({
    where: { tableSessionId: sessionId },
  });
  const total = items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0,
  );
  await tx.tableSession.update({
    where: { id: sessionId },
    data: { total },
  });
  return total;
}

const sessionOpenSelect = {
  id: true,
  tableId: true,
  waiterId: true,
  guestCount: true,
  openedAt: true,
  closedAt: true,
  status: true,
  total: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicOpenSession = {
  id: number;
  tableId: number;
  waiterId: number;
  guestCount: number;
  openedAt: Date;
  closedAt: Date | null;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  waiter: { id: number; name: string; isActive: boolean };
};

export async function openSession(
  data: OpenSessionBody,
): Promise<PublicOpenSession> {
  return prisma.$transaction(async (tx) => {
    const table = await tx.restaurantTable.findUnique({
      where: { id: data.tableId },
    });
    if (!table) {
      throw notFound("Mesa no encontrada");
    }
    if (!table.isActive) {
      throw badRequest("La mesa no está activa");
    }
    if (table.status !== TABLE_STATUS.FREE) {
      throw conflict("La mesa no está disponible");
    }
    if (data.guestCount > table.capacity) {
      throw badRequest(
        `La mesa tiene capacidad para ${table.capacity} persona${table.capacity === 1 ? "" : "s"}`,
      );
    }

    const existingOpen = await tx.tableSession.findFirst({
      where: {
        tableId: data.tableId,
        status: SESSION_STATUS.OPEN,
      },
    });
    if (existingOpen) {
      throw conflict("Esta mesa ya tiene una sesión abierta");
    }

    const waiter = await tx.waiter.findUnique({
      where: { id: data.waiterId },
    });
    if (!waiter) {
      throw notFound("Mesero no encontrado");
    }
    if (!waiter.isActive) {
      throw badRequest("El mesero no está activo");
    }

    const session = await tx.tableSession.create({
      data: {
        tableId: data.tableId,
        waiterId: data.waiterId,
        guestCount: data.guestCount,
        status: SESSION_STATUS.OPEN,
        total: 0,
      },
      select: sessionOpenSelect,
    });

    await tx.restaurantTable.update({
      where: { id: data.tableId },
      data: { status: TABLE_STATUS.OCCUPIED },
    });

    const waiterRow = await tx.waiter.findUniqueOrThrow({
      where: { id: data.waiterId },
      select: { id: true, name: true, isActive: true },
    });

    return {
      ...session,
      total: Number(session.total),
      waiter: waiterRow,
    };
  });
}

export type SessionItemPublic = {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  note: string | null;
  lineTotal: number;
};

function toSessionItemPublic(item: {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: unknown;
  productName: string;
  note: string | null;
}): SessionItemPublic {
  const unitPrice = Number(item.unitPrice);
  return {
    id: item.id,
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    unitPrice,
    productName: item.productName,
    note: item.note,
    lineTotal: unitPrice * item.quantity,
  };
}

export async function addSessionItem(
  sessionId: number,
  body: AddSessionItemBody,
): Promise<{
  session: { id: number; total: number };
  item: SessionItemPublic;
}> {
  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw notFound("Sesión no encontrada");
    }
    if (session.status !== SESSION_STATUS.OPEN) {
      throw conflict("No se pueden agregar ítems a una sesión cerrada");
    }

    const menuItem = await tx.menuItem.findUnique({
      where: { id: body.menuItemId },
    });
    if (!menuItem) {
      throw notFound("Ítem de menú no encontrado");
    }
    if (!menuItem.isActive) {
      throw badRequest("El ítem de menú no está activo");
    }

    const unitPriceNum = Number(menuItem.price);
    const lineTotal = body.quantity * unitPriceNum;

    const item = await tx.sessionItem.create({
      data: {
        tableSessionId: sessionId,
        menuItemId: body.menuItemId,
        quantity: body.quantity,
        unitPrice: menuItem.price,
        productName: menuItem.name,
        note: body.note ?? null,
      },
    });

    const newTotal = Number(session.total) + lineTotal;
    await tx.tableSession.update({
      where: { id: sessionId },
      data: { total: newTotal },
    });

    return {
      session: { id: sessionId, total: newTotal },
      item: toSessionItemPublic(item),
    };
  });
}

export async function updateSessionItem(
  sessionId: number,
  itemId: number,
  body: UpdateSessionItemBody,
): Promise<{
  session: { id: number; total: number };
  item: SessionItemPublic;
}> {
  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw notFound("Sesión no encontrada");
    }
    if (session.status !== SESSION_STATUS.OPEN) {
      throw conflict("No se pueden modificar ítems en una sesión cerrada");
    }

    const existing = await tx.sessionItem.findFirst({
      where: { id: itemId, tableSessionId: sessionId },
    });
    if (!existing) {
      throw notFound("Línea de consumo no encontrada");
    }

    const nextQuantity =
      body.quantity !== undefined ? body.quantity : existing.quantity;
    let nextNote = existing.note;
    if (body.note !== undefined) {
      if (body.note === null || body.note === "") {
        nextNote = null;
      } else {
        const trimmed = body.note.trim();
        nextNote = trimmed === "" ? null : trimmed;
      }
    }

    const updated = await tx.sessionItem.update({
      where: { id: itemId },
      data: {
        quantity: nextQuantity,
        note: nextNote,
      },
    });

    const total = await setSessionTotalFromItems(tx, sessionId);

    return {
      session: { id: sessionId, total },
      item: toSessionItemPublic(updated),
    };
  });
}

export async function updateOpenSessionMeta(
  sessionId: number,
  data: UpdateOpenSessionBody,
): Promise<PublicOpenSession> {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw notFound("Sesión no encontrada");
  }
  if (session.status !== SESSION_STATUS.OPEN) {
    throw conflict("Solo se puede editar una sesión abierta");
  }

  const table = await prisma.restaurantTable.findUnique({
    where: { id: session.tableId },
  });
  if (!table) {
    throw notFound("Mesa no encontrada");
  }

  const nextGuestCount =
    data.guestCount !== undefined ? data.guestCount : session.guestCount;
  if (nextGuestCount < 1 || nextGuestCount > table.capacity) {
    throw badRequest(
      `La cantidad de personas debe estar entre 1 y ${table.capacity} (capacidad de la mesa)`,
    );
  }

  if (data.waiterId !== undefined) {
    const waiter = await prisma.waiter.findUnique({
      where: { id: data.waiterId },
    });
    if (!waiter) {
      throw notFound("Mesero no encontrado");
    }
    if (!waiter.isActive) {
      throw badRequest("El mesero no está activo");
    }
  }

  const updated = await prisma.tableSession.update({
    where: { id: sessionId },
    data: {
      ...(data.guestCount !== undefined ? { guestCount: data.guestCount } : {}),
      ...(data.waiterId !== undefined ? { waiterId: data.waiterId } : {}),
    },
    include: {
      waiter: { select: { id: true, name: true, isActive: true } },
    },
  });

  return {
    id: updated.id,
    tableId: updated.tableId,
    waiterId: updated.waiterId,
    guestCount: updated.guestCount,
    openedAt: updated.openedAt,
    closedAt: updated.closedAt,
    status: updated.status,
    total: Number(updated.total),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    waiter: updated.waiter,
  };
}

export async function deleteSessionItem(
  sessionId: number,
  itemId: number,
): Promise<{ session: { id: number; total: number } }> {
  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw notFound("Sesión no encontrada");
    }
    if (session.status !== SESSION_STATUS.OPEN) {
      throw conflict("No se pueden modificar ítems en una sesión cerrada");
    }

    const existing = await tx.sessionItem.findFirst({
      where: { id: itemId, tableSessionId: sessionId },
    });
    if (!existing) {
      throw notFound("Línea de consumo no encontrada");
    }

    await tx.sessionItem.delete({ where: { id: itemId } });

    const total = await setSessionTotalFromItems(tx, sessionId);

    return {
      session: { id: sessionId, total },
    };
  });
}

export type CloseSessionResult = {
  total: number;
  guestCount: number;
  items: SessionItemPublic[];
};

export async function closeSession(
  sessionId: number,
): Promise<CloseSessionResult> {
  return prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        items: { orderBy: { id: "asc" } },
      },
    });
    if (!session) {
      throw notFound("Sesión no encontrada");
    }
    if (session.status !== SESSION_STATUS.OPEN) {
      throw conflict("La sesión ya está cerrada");
    }

    const total = session.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );

    const items: SessionItemPublic[] = session.items.map((i) => {
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

    await tx.tableSession.update({
      where: { id: sessionId },
      data: {
        status: SESSION_STATUS.CLOSED,
        closedAt: new Date(),
        total,
      },
    });

    await tx.restaurantTable.update({
      where: { id: session.tableId },
      data: { status: TABLE_STATUS.FREE },
    });

    return {
      total,
      guestCount: session.guestCount,
      items,
    };
  });
}

export async function getSessionById(sessionId: number) {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId },
    include: {
      waiter: { select: { id: true, name: true, isActive: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!session) {
    throw notFound("Sesión no encontrada");
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
    id: session.id,
    tableId: session.tableId,
    waiterId: session.waiterId,
    guestCount: session.guestCount,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
    status: session.status,
    total: Number(session.total),
    waiter: session.waiter,
    items,
  };
}
