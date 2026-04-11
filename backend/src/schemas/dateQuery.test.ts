import { describe, expect, it } from "vitest";

import { dashboardRangeQuerySchema } from "./dateQuery";

describe("dashboardRangeQuerySchema", () => {
  it("accepts valid from/to", () => {
    const r = dashboardRangeQuerySchema.safeParse({
      from: "2026-01-01",
      to: "2026-01-31",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid format", () => {
    const r = dashboardRangeQuerySchema.safeParse({
      from: "2026-1-1",
      to: "2026-01-31",
    });
    expect(r.success).toBe(false);
  });
});
