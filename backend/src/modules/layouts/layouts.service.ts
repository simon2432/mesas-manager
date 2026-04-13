import { prisma } from "../../lib/prisma";
import { badRequest, conflict, notFound } from "../../utils/httpError";
import type {
  CreateLayoutBody,
  SetLayoutTablesBody,
  UpdateLayoutBody,
} from "./layouts.schemas";

const tableInLayoutSelect = {
  id: true,
  number: true,
  capacity: true,
  status: true,
  isActive: true,
} as const;

export type LayoutTableSummary = {
  id: number;
  number: number;
  capacity: number;
  status: string;
  isActive: boolean;
};

export type PublicLayout = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tables: LayoutTableSummary[];
};

const layoutInclude = {
  layoutTables: {
    include: {
      table: { select: tableInLayoutSelect },
    },
  },
} as const;

type LayoutRow = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  layoutTables: Array<{ table: LayoutTableSummary }>;
};

function toPublicLayout(row: LayoutRow): PublicLayout {
  const tables = row.layoutTables
    .map((lt) => lt.table)
    .sort((a, b) => a.number - b.number);
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    tables,
  };
}

async function findLayoutRow(id: number): Promise<LayoutRow> {
  const row = await prisma.layout.findUnique({
    where: { id },
    include: layoutInclude,
  });
  if (!row) {
    throw notFound("Layout no encontrado");
  }
  return row as LayoutRow;
}

export async function getAllLayouts(): Promise<PublicLayout[]> {
  const rows = await prisma.layout.findMany({
    include: layoutInclude,
    orderBy: { name: "asc" },
  });
  return rows.map((r) => toPublicLayout(r as LayoutRow));
}

export async function getLayoutById(id: number): Promise<PublicLayout> {
  const row = await findLayoutRow(id);
  return toPublicLayout(row);
}

export async function createLayout(
  data: CreateLayoutBody,
): Promise<PublicLayout> {
  const name = data.name.trim();
  const existing = await prisma.layout.findFirst({ where: { name } });
  if (existing) {
    throw conflict("Ya existe un layout con ese nombre");
  }

  const row = await prisma.layout.create({
    data: { name },
    include: layoutInclude,
  });
  return toPublicLayout(row as LayoutRow);
}

export async function updateLayout(
  id: number,
  data: UpdateLayoutBody,
): Promise<PublicLayout> {
  const name = data.name.trim();
  await findLayoutRow(id);

  const duplicate = await prisma.layout.findFirst({
    where: {
      name,
      NOT: { id },
    },
  });
  if (duplicate) {
    throw conflict("Ya existe un layout con ese nombre");
  }

  const row = await prisma.layout.update({
    where: { id },
    data: { name },
    include: layoutInclude,
  });
  return toPublicLayout(row as LayoutRow);
}

export async function deleteLayout(id: number): Promise<void> {
  const layout = await prisma.layout.findUnique({ where: { id } });
  if (!layout) {
    throw notFound("Layout no encontrado");
  }
  await prisma.layout.delete({ where: { id } });
}

export async function setLayoutTables(
  layoutId: number,
  body: SetLayoutTablesBody,
): Promise<PublicLayout> {
  const uniqueIds = [...new Set(body.tableIds)];

  return prisma.$transaction(async (tx) => {
    const layout = await tx.layout.findUnique({ where: { id: layoutId } });
    if (!layout) {
      throw notFound("Layout no encontrado");
    }

    if (uniqueIds.length > 0) {
      const tables = await tx.restaurantTable.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true, isActive: true },
      });
      if (tables.length !== uniqueIds.length) {
        throw badRequest("Una o más mesas no existen");
      }
      const inactive = tables.filter((t) => !t.isActive);
      if (inactive.length > 0) {
        throw badRequest("Todas las mesas del layout deben estar activas");
      }
    }

    await tx.layoutTable.deleteMany({ where: { layoutId } });

    if (uniqueIds.length > 0) {
      await tx.layoutTable.createMany({
        data: uniqueIds.map((tableId) => ({ layoutId, tableId })),
      });
    }

    const row = await tx.layout.findUniqueOrThrow({
      where: { id: layoutId },
      include: layoutInclude,
    });
    return toPublicLayout(row as LayoutRow);
  });
}
