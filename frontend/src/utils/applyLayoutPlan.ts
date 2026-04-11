import type { LayoutTableSummary } from "@/src/api/layouts.api";
import type { PublicTable } from "@/src/types/tables.types";

export type ApplyLayoutPlan = {
  toggleIds: number[];
  skippedInactiveNumbers: number[];
  inLayoutActiveIds: number[];
};

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
