import { describe, expect, it } from "vitest";

import {
  getLocalDayBoundsForYmd,
  inclusiveCalendarDayCount,
} from "./localDayBounds";

describe("inclusiveCalendarDayCount", () => {
  it("returns 1 for the same day", () => {
    expect(inclusiveCalendarDayCount("2026-04-08", "2026-04-08")).toBe(1);
  });

  it("counts inclusive calendar days across a week", () => {
    expect(inclusiveCalendarDayCount("2026-04-01", "2026-04-07")).toBe(7);
  });

  it("handles month boundary", () => {
    expect(inclusiveCalendarDayCount("2026-03-30", "2026-04-02")).toBe(4);
  });
});

describe("getLocalDayBoundsForYmd", () => {
  it("returns start before end on the same calendar day", () => {
    const { start, end } = getLocalDayBoundsForYmd("2026-06-15");
    expect(start.getTime()).toBeLessThan(end.getTime());
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(23);
  });
});
