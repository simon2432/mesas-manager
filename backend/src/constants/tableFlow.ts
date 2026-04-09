/** Valores persistidos en DB (SQL Server sin enums en Prisma). */

export const TABLE_STATUS = {
  FREE: "FREE",
  OCCUPIED: "OCCUPIED",
} as const;

export const SESSION_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];
export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
