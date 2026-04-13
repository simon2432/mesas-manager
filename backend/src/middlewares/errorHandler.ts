import type { NextFunction, Request, Response } from "express";

/** Respuestas claras cuando falla la conexión a SQL Server (Prisma). */
function prismaDatabaseHint(
  err: unknown,
): { status: number; message: string } | null {
  if (typeof err !== "object" || err === null) return null;
  const e = err as { code?: string };
  if (e.code === "ELOGIN" || e.code === "P1000") {
    return {
      status: 503,
      message:
        "SQL Server rechazó el usuario o la contraseña (revisá DATABASE_URL en .env). " +
        "Si usás Docker, la contraseña debe ser la misma que SA_PASSWORD en database/docker-compose.yml. " +
        "Si la clave tiene ! o @, codificá en la URL (! → %21, @ → %40). Ver SETUP.md.",
    };
  }
  if (e.code === "P1001") {
    return {
      status: 503,
      message:
        "No se alcanza SQL Server (host, puerto o firewall). Comprobá que el servicio o el contenedor Docker esté en ejecución.",
    };
  }
  return null;
}

function getStatusCode(err: unknown): number {
  if (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
  ) {
    return (err as { statusCode: number }).statusCode;
  }
  return 500;
}

function getClientMessage(err: unknown, statusCode: number): string {
  if (statusCode >= 500) {
    return "Error interno del servidor";
  }
  if (err instanceof Error) {
    return err.message;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Solicitud inválida";
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);
  const dbHint = prismaDatabaseHint(err);
  if (dbHint) {
    res.status(dbHint.status).json({ message: dbHint.message });
    return;
  }
  const statusCode = getStatusCode(err);
  const message = getClientMessage(err, statusCode);
  res.status(statusCode).json({ message });
}
