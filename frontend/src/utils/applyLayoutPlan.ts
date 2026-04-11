import type { LayoutTableSummary } from "@/src/api/layouts.api";
import type { PublicTable } from "@/src/types/tables.types";

export type ApplyLayoutPlan = {
  /** IDs de mesas a las que hay que llamar `toggle-active` una vez cada una. */
  toggleIds: number[];
  /** Números de mesa que figuran en el layout pero están desactivadas en catálogo (no se activan solas). */
  skippedInactiveNumbers: number[];
  /** IDs en el layout con `isActive` true en la definición (para el store / UI). */
  inLayoutActiveIds: number[];
};

/**
 * Reglas:
 * - Solo activar: mesa en el layout (definición activa en catálogo) y hoy inactiva en salón.
 * - No se desactiva ninguna mesa por estar fuera del layout; esas quedan activas y se muestran
 *   debajo del recuadro del layout en la página principal.
 * - Mesas en el layout pero desactivadas en catálogo: no se tocan; se listan en skippedInactiveNumbers.
 */
export function computeApplyLayoutPlan(
  allTables: PublicTable[],
  layoutTables: LayoutTableSummary[],
): ApplyLayoutPlan {
  const inLayoutActiveIds = layoutTables
    .filter((t) => t.isActive)
    .map((t) => t.id);
  const inLayoutActiveSet = new Set(inLayoutActiveIds);

  const skippedInactiveNumbers = layoutTables
    .filter((t) => !t.isActive)
    .map((t) => t.number)
    .sort((a, b) => a - b);

  const toggleIds: number[] = [];

  for (const t of allTables) {
    if (inLayoutActiveSet.has(t.id) && !t.isActive) {
      toggleIds.push(t.id);
    }
  }

  return {
    toggleIds,
    skippedInactiveNumbers,
    inLayoutActiveIds,
  };
}
