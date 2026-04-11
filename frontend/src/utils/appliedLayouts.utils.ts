import type { AppliedLayoutEntry } from "@/src/store/appliedLayout.store";

export function newLayoutOverlapsApplied(
  newTableIds: number[],
  applied: AppliedLayoutEntry[],
): boolean {
  if (applied.length === 0) return false;
  const union = new Set(applied.flatMap((x) => x.layoutTableIds));
  return newTableIds.some((id) => union.has(id));
}

export function stripAppliedFromFrontUntilNoOverlap(
  applied: AppliedLayoutEntry[],
  newTableIds: number[],
): AppliedLayoutEntry[] {
  const newSet = new Set(newTableIds);
  let remaining = [...applied];
  while (remaining.length > 0) {
    const union = new Set(remaining.flatMap((x) => x.layoutTableIds));
    const hasOverlap = [...newSet].some((id) => union.has(id));
    if (!hasOverlap) break;
    remaining = remaining.slice(1);
  }
  return remaining;
}
