import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV ?? "development";

function required(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
  JWT_SECRET:
    NODE_ENV === "production"
      ? required("JWT_SECRET", process.env.JWT_SECRET)
      : (process.env.JWT_SECRET ?? "dev-jwt-secret-change-me"),
  /** Origen del cliente (CORS). Vacío = comportamiento permisivo de desarrollo. */
  CLIENT_URL: process.env.CLIENT_URL?.trim() ?? "",
} as const;
