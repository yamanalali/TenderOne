import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeTenderStatus } from "@/lib/tenders";
import { daysUntil } from "@/lib/utils";

describe("computeTenderStatus", () => {
  it("marks closed tenders after deadline", () => {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    assert.equal(computeTenderStatus(past, null, 7, 3), "closed");
  });

  it("marks ending soon within configured window", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    assert.equal(computeTenderStatus(soon, null, 7, 3), "ending_soon");
  });

  it("marks new tenders published recently", () => {
    const published = new Date();
    published.setDate(published.getDate() - 1);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20);
    assert.equal(computeTenderStatus(deadline, published, 7, 3), "new");
  });

  it("marks open otherwise", () => {
    const published = new Date();
    published.setDate(published.getDate() - 10);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 20);
    assert.equal(computeTenderStatus(deadline, published, 7, 3), "open");
  });
});

describe("daysUntil", () => {
  it("returns null for invalid dates", () => {
    assert.equal(daysUntil(null), null);
    assert.equal(daysUntil("not-a-date"), null);
  });
});
