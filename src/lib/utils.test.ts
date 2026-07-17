import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cn, daysUntil, formatDate, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    assert.equal(cn("foo", "bar"), "foo bar");
  });

  it("resolves tailwind conflicts", () => {
    assert.equal(cn("p-2", "p-4"), "p-4");
  });

  it("ignores falsy values", () => {
    assert.equal(cn("a", false, null, undefined, "b"), "a b");
  });
});

describe("formatDate", () => {
  it("returns dash for null or undefined", () => {
    assert.equal(formatDate(null), "—");
    assert.equal(formatDate(undefined), "—");
  });

  it("returns dash for invalid date strings", () => {
    assert.equal(formatDate("not-a-date"), "—");
  });

  it("formats a valid date", () => {
    const formatted = formatDate("2026-07-17T12:00:00.000Z", "en-US");
    assert.match(formatted, /2026/);
    assert.match(formatted, /Jul/);
  });
});

describe("daysUntil", () => {
  it("returns null for null or invalid dates", () => {
    assert.equal(daysUntil(null), null);
    assert.equal(daysUntil(undefined), null);
    assert.equal(daysUntil("not-a-date"), null);
  });

  it("returns 0 for today", () => {
    const today = new Date();
    assert.equal(daysUntil(today), 0);
  });

  it("returns 1 for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    assert.equal(daysUntil(tomorrow), 1);
  });

  it("returns -1 for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    assert.equal(daysUntil(yesterday), -1);
  });

  it("accepts ISO string inputs", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    assert.equal(daysUntil(tomorrow.toISOString()), 1);
  });
});

describe("slugify", () => {
  it("converts spaces to dashes and lowercases latin text", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("strips symbols", () => {
    assert.equal(slugify("hello@world!"), "helloworld");
  });

  it("keeps Arabic characters", () => {
    assert.equal(slugify("مناقصة عامة"), "مناقصة-عامة");
  });

  it("collapses repeated dashes", () => {
    assert.equal(slugify("a   b---c"), "a-b-c");
  });
});
