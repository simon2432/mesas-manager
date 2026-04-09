import type { NextFunction, Request, Response } from "express";

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
    return "Internal server error";
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
  return "Bad request";
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);
  const statusCode = getStatusCode(err);
  const message = getClientMessage(err, statusCode);
  res.status(statusCode).json({ message });
}
