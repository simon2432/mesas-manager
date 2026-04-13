import type { AppliedLayoutEntry } from "@/src/store/appliedLayout.store";

export function newLayoutOverlapsApplied(
  newTableIds: number[],
  applied: AppliedLayoutEntry[],
): boolean {
  if (applied.length === 0) return false;
  const union = new Set(applied.flatMap((x) => x.layoutTableIds));
  return newTableIds.some((id) => union.has(id));
}

/**
 * Quita de `applied` solo las entradas que comparten alguna mesa con
 * `newTableIds` (en orden: primero las que aparecen antes en la lista),
 * hasta que no quede solape. Las demás agrupaciones se conservan.
 */
export function stripAppliedLayoutsOverlappingNew(
  applied: AppliedLayoutEntry[],
  newTableIds: number[],
): AppliedLayoutEntry[] {
  const newSet = new Set(newTableIds);
  let remaining = [...applied];
  while (remaining.length > 0) {
    const idx = remaining.findIndex((e) =>
      e.layoutTableIds.some((id) => newSet.has(id)),
    );
    if (idx === -1) break;
    remaining = remaining.filter((_, i) => i !== idx);
  }
  return remaining;
}
