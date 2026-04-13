/**
 * Carga datos de demostración para probar Mesas Manager sin configurar todo a mano.
 *
 * Uso (desde la carpeta backend, con .env y migraciones aplicadas):
 *   npm run db:seed
 *
 * En producción solo corre si definís ALLOW_DEMO_SEED=1.
 *
 * Credenciales de acceso (tras el seed):
 *   Email:    demo@mesas.local
 *   Password: Demo1234
 */

import "dotenv/config";

import bcrypt from "bcrypt";

import { SESSION_STATUS, TABLE_STATUS } from "../src/constants/tableFlow";
import { prisma } from "../src/lib/prisma";

const BCRYPT_ROUNDS = 10;

const DEMO_USER = {
  email: "demo@mesas.local",
  password: "Demo1234",
  name: "Usuario demo",
} as const;

function assertSafeToRun(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
    console.error(
      "[seed] No se ejecuta en NODE_ENV=production sin ALLOW_DEMO_SEED=1.",
    );
    process.exit(1);
  }
}

/** Mediodía / tarde local en un día relativo a hoy (para closedAt / openedAt coherentes). */
function localDaysAgo(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  d.setMilliseconds(0);
  return d;
}

async function wipe(): Promise<void> {
  console.log("[seed] Limpiando datos existentes…");
  await prisma.sessionItem.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.layoutTable.deleteMany();
  await prisma.layout.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.waiter.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, BCRYPT_ROUNDS);
  await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      passwordHash,
    },
  });
  console.log("[seed] Usuario demo creado.");
}

async function seedWaiters(): Promise<{ id: number; name: string }[]> {
  const names = ["Ana López", "Bruno García", "Carla Méndez"];
  const rows: { id: number; name: string }[] = [];
  for (const name of names) {
    const w = await prisma.waiter.create({ data: { name } });
    rows.push({ id: w.id, name: w.name });
  }
  console.log(`[seed] ${rows.length} meseros.`);
  return rows;
}

async function seedTables(): Promise<Map<number, number>> {
  const specs: { number: number; capacity: number }[] = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 4 },
    { number: 5, capacity: 4 },
    { number: 6, capacity: 6 },
    { number: 7, capacity: 6 },
    { number: 8, capacity: 8 },
  ];
  const byNumber = new Map<number, number>();
  for (const s of specs) {
    const t = await prisma.restaurantTable.create({
      data: {
        number: s.number,
        capacity: s.capacity,
        status: TABLE_STATUS.FREE,
        isActive: true,
      },
    });
    byNumber.set(s.number, t.id);
  }
  console.log(`[seed] ${byNumber.size} mesas.`);
  return byNumber;
}

async function seedMenu(): Promise<Map<string, number>> {
  const items: {
    name: string;
    description: string | null;
    price: number;
  }[] = [
    { name: "Empanadas (3 u.)", description: "Carne, pollo o jamón y queso", price: 4500 },
    { name: "Milanesa napolitana", description: "Con fritas o ensalada", price: 12500 },
    { name: "Ensalada Caesar", description: "Lechuga, parmesano, croutons", price: 8200 },
    { name: "Flan casero", description: null, price: 3800 },
    { name: "Coca-Cola 500 ml", description: null, price: 2800 },
    { name: "Agua sin gas", description: null, price: 2200 },
    { name: "Café espresso", description: null, price: 2100 },
    { name: "Vino tinto copa", description: "Casa", price: 3500 },
  ];
  const byName = new Map<string, number>();
  for (const it of items) {
    const row = await prisma.menuItem.create({
      data: {
        name: it.name,
        description: it.description,
        price: it.price,
        isActive: true,
      },
    });
    byName.set(it.name, row.id);
  }
  console.log(`[seed] ${byName.size} ítems de menú.`);
  return byName;
}

async function seedLayouts(tableByNumber: Map<number, number>): Promise<void> {
  const salon = await prisma.layout.create({
    data: { name: "Salón principal" },
  });
  const terraza = await prisma.layout.create({
    data: { name: "Terraza" },
  });

  const salonNums = [1, 2, 3, 4];
  const terrazaNums = [5, 6, 7];

  await prisma.layoutTable.createMany({
    data: salonNums.map((n) => ({
      layoutId: salon.id,
      tableId: tableByNumber.get(n)!,
    })),
  });
  await prisma.layoutTable.createMany({
    data: terrazaNums.map((n) => ({
      layoutId: terraza.id,
      tableId: tableByNumber.get(n)!,
    })),
  });
  console.log("[seed] 2 layouts (Salón principal, Terraza).");
}

type Line = { name: string; qty: number };

async function createClosedSession(args: {
  tableNumber: number;
  waiterId: number;
  guestCount: number;
  openedAt: Date;
  closedAt: Date;
  lines: Line[];
  tableByNumber: Map<number, number>;
  menuByName: Map<string, number>;
}): Promise<void> {
  const tableId = args.tableByNumber.get(args.tableNumber);
  if (tableId === undefined) throw new Error(`Mesa ${args.tableNumber}`);

  await prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.create({
      data: {
        tableId,
        waiterId: args.waiterId,
        guestCount: args.guestCount,
        openedAt: args.openedAt,
        closedAt: args.closedAt,
        status: SESSION_STATUS.CLOSED,
        total: 0,
      },
    });

    let total = 0;
    for (const line of args.lines) {
      const menuId = args.menuByName.get(line.name);
      if (menuId === undefined) throw new Error(`Menú: ${line.name}`);
      const mi = await tx.menuItem.findUniqueOrThrow({ where: { id: menuId } });
      const unit = Number(mi.price);
      total += unit * line.qty;
      await tx.sessionItem.create({
        data: {
          tableSessionId: session.id,
          menuItemId: menuId,
          quantity: line.qty,
          unitPrice: mi.price,
          productName: mi.name,
          note: null,
        },
      });
    }

    await tx.tableSession.update({
      where: { id: session.id },
      data: { total },
    });
  });
}

async function createOpenSession(args: {
  tableNumber: number;
  waiterId: number;
  guestCount: number;
  lines: Line[];
  tableByNumber: Map<number, number>;
  menuByName: Map<string, number>;
}): Promise<void> {
  const tableId = args.tableByNumber.get(args.tableNumber);
  if (tableId === undefined) throw new Error(`Mesa ${args.tableNumber}`);

  await prisma.$transaction(async (tx) => {
    const session = await tx.tableSession.create({
      data: {
        tableId,
        waiterId: args.waiterId,
        guestCount: args.guestCount,
        status: SESSION_STATUS.OPEN,
        total: 0,
        openedAt: new Date(),
      },
    });

    let total = 0;
    for (const line of args.lines) {
      const menuId = args.menuByName.get(line.name);
      if (menuId === undefined) throw new Error(`Menú: ${line.name}`);
      const mi = await tx.menuItem.findUniqueOrThrow({ where: { id: menuId } });
      const unit = Number(mi.price);
      total += unit * line.qty;
      await tx.sessionItem.create({
        data: {
          tableSessionId: session.id,
          menuItemId: menuId,
          quantity: line.qty,
          unitPrice: mi.price,
          productName: mi.name,
          note: null,
        },
      });
    }

    await tx.tableSession.update({
      where: { id: session.id },
      data: { total },
    });

    await tx.restaurantTable.update({
      where: { id: tableId },
      data: { status: TABLE_STATUS.OCCUPIED },
    });
  });
}

async function seedHistory(
  waiters: { id: number }[],
  tableByNumber: Map<number, number>,
  menuByName: Map<string, number>,
): Promise<void> {
  const w = (i: number) => waiters[i % waiters.length]!.id;

  const sessions: {
    tableNumber: number;
    waiterIndex: number;
    guestCount: number;
    daysAgo: number;
    openHour: number;
    closeHour: number;
    lines: Line[];
  }[] = [
    {
      tableNumber: 1,
      waiterIndex: 0,
      guestCount: 2,
      daysAgo: 4,
      openHour: 12,
      closeHour: 14,
      lines: [
        { name: "Empanadas (3 u.)", qty: 1 },
        { name: "Coca-Cola 500 ml", qty: 2 },
      ],
    },
    {
      tableNumber: 3,
      waiterIndex: 1,
      guestCount: 4,
      daysAgo: 4,
      openHour: 20,
      closeHour: 22,
      lines: [
        { name: "Milanesa napolitana", qty: 2 },
        { name: "Ensalada Caesar", qty: 1 },
        { name: "Vino tinto copa", qty: 2 },
      ],
    },
    {
      tableNumber: 2,
      waiterIndex: 2,
      guestCount: 2,
      daysAgo: 3,
      openHour: 13,
      closeHour: 14,
      lines: [
        { name: "Milanesa napolitana", qty: 1 },
        { name: "Agua sin gas", qty: 2 },
      ],
    },
    {
      tableNumber: 5,
      waiterIndex: 0,
      guestCount: 3,
      daysAgo: 2,
      openHour: 12,
      closeHour: 13,
      lines: [
        { name: "Empanadas (3 u.)", qty: 2 },
        { name: "Coca-Cola 500 ml", qty: 3 },
      ],
    },
    {
      tableNumber: 6,
      waiterIndex: 1,
      guestCount: 5,
      daysAgo: 2,
      openHour: 21,
      closeHour: 23,
      lines: [
        { name: "Milanesa napolitana", qty: 3 },
        { name: "Flan casero", qty: 2 },
        { name: "Café espresso", qty: 2 },
      ],
    },
    {
      tableNumber: 4,
      waiterIndex: 2,
      guestCount: 2,
      daysAgo: 1,
      openHour: 12,
      closeHour: 13,
      lines: [{ name: "Ensalada Caesar", qty: 1 }, { name: "Agua sin gas", qty: 2 }],
    },
    {
      tableNumber: 1,
      waiterIndex: 0,
      guestCount: 4,
      daysAgo: 1,
      openHour: 20,
      closeHour: 22,
      lines: [
        { name: "Empanadas (3 u.)", qty: 2 },
        { name: "Milanesa napolitana", qty: 2 },
        { name: "Coca-Cola 500 ml", qty: 3 },
      ],
    },
    {
      tableNumber: 7,
      waiterIndex: 1,
      guestCount: 2,
      daysAgo: 1,
      openHour: 15,
      closeHour: 16,
      lines: [{ name: "Café espresso", qty: 2 }, { name: "Flan casero", qty: 1 }],
    },
  ];

  for (const s of sessions) {
    await createClosedSession({
      tableNumber: s.tableNumber,
      waiterId: w(s.waiterIndex),
      guestCount: s.guestCount,
      openedAt: localDaysAgo(s.daysAgo, s.openHour, 10),
      closedAt: localDaysAgo(s.daysAgo, s.closeHour, 25),
      lines: s.lines,
      tableByNumber,
      menuByName,
    });
  }

  console.log(`[seed] ${sessions.length} sesiones cerradas (últimos días).`);
}

async function main(): Promise<void> {
  assertSafeToRun();
  await wipe();
  await seedUser();
  const waiters = await seedWaiters();
  const tableByNumber = await seedTables();
  const menuByName = await seedMenu();
  await seedLayouts(tableByNumber);
  await seedHistory(waiters, tableByNumber, menuByName);

  await createOpenSession({
    tableNumber: 8,
    waiterId: waiters[0]!.id,
    guestCount: 4,
    lines: [
      { name: "Empanadas (3 u.)", qty: 1 },
      { name: "Milanesa napolitana", qty: 2 },
      { name: "Coca-Cola 500 ml", qty: 2 },
    ],
    tableByNumber,
    menuByName,
  });
  console.log("[seed] 1 mesa ocupada con sesión abierta (mesa 8).");

  console.log("\n--- Listo ---");
  console.log(`Iniciá sesión en la app con:\n  Email:    ${DEMO_USER.email}\n  Password: ${DEMO_USER.password}`);
  console.log(
    "En Historial probá fechas de los últimos 4–5 días (según el calendario del servidor).",
  );
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
