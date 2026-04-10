/** Inicio y fin del día calendario en hora local del servidor. */

export function getLocalDayBounds(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getLocalServerTodayYmd(): string {
  return formatLocalYmd(new Date());
}

/** `ymd` = YYYY-MM-DD interpretado en la zona horaria local del proceso (servidor). */
export function getLocalDayBoundsForYmd(ymd: string): { start: Date; end: Date } {
  const trimmed = ymd.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) {
    throw new Error("Invalid date format");
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const start = new Date(y, mo, d, 0, 0, 0, 0);
  if (
    start.getFullYear() !== y ||
    start.getMonth() !== mo ||
    start.getDate() !== d
  ) {
    throw new Error("Invalid calendar date");
  }
  const end = new Date(y, mo, d, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Resuelve el rango del día: sin query usa hoy en el servidor; con `date` usa ese YYYY-MM-DD local.
 */
export function resolveLocalDayBounds(dateParam: string | undefined): {
  start: Date;
  end: Date;
  ymd: string;
} {
  if (dateParam == null || dateParam === "") {
    const { start, end } = getLocalDayBounds();
    return { start, end, ymd: formatLocalYmd(start) };
  }
  const { start, end } = getLocalDayBoundsForYmd(dateParam);
  return { start, end, ymd: dateParam.trim() };
}
