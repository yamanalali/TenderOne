import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeTenderStatus, statusMeta } from "@/lib/tenders";
import { daysUntil } from "@/lib/utils";

function shiftDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

describe("computeTenderStatus", () => {
  it("marks closed tenders after deadline", () => {
    assert.equal(computeTenderStatus(shiftDays(-2), null, 7, 3), "closed");
  });

  it("marks ending soon within configured window", () => {
    assert.equal(computeTenderStatus(shiftDays(3), null, 7, 3), "ending_soon");
  });

  it("marks deadline today as ending_soon", () => {
    assert.equal(computeTenderStatus(shiftDays(0), null, 7, 3), "ending_soon");
  });

  it("marks deadline exactly endingSoonDays away as ending_soon", () => {
    assert.equal(computeTenderStatus(shiftDays(7), null, 7, 3), "ending_soon");
  });

  it("marks new tenders published recently", () => {
    assert.equal(
      computeTenderStatus(shiftDays(20), shiftDays(-1), 7, 3),
      "new",
    );
  });

  it("marks open when deadline is past ending window and publish is old", () => {
    assert.equal(
      computeTenderStatus(shiftDays(20), shiftDays(-10), 7, 3),
      "open",
    );
  });

  it("marks open when there is no deadline and no publish date", () => {
    assert.equal(computeTenderStatus(null, null, 7, 3), "open");
  });

  it("prefers closed over new when deadline has passed", () => {
    assert.equal(
      computeTenderStatus(shiftDays(-1), shiftDays(0), 7, 3),
      "closed",
    );
  });

  it("marks open when deadline is just past the ending-soon window", () => {
    assert.equal(
      computeTenderStatus(shiftDays(8), shiftDays(-10), 7, 3),
      "open",
    );
  });
});

describe("statusMeta", () => {
  it("has label and color for every status", () => {
    for (const status of ["open", "ending_soon", "closed", "new"] as const) {
      assert.ok(statusMeta[status].label);
      assert.ok(statusMeta[status].color);
    }
  });
});

describe("daysUntil", () => {
  it("returns null for invalid dates", () => {
    assert.equal(daysUntil(null), null);
    assert.equal(daysUntil("not-a-date"), null);
  });
});
