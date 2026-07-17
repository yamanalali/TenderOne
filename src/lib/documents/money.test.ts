import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calcGrandTotal,
  calcLineTotal,
  calcSubtotal,
  calcTax,
  formatMoney,
  type LineItem,
} from "@/lib/documents/types";

const items: LineItem[] = [
  { id: "1", description: "خدمة استشارية", quantity: 2, unitPrice: 500 },
  { id: "2", description: "تنفيذ", quantity: 1, unitPrice: 250.5 },
];

describe("line item math (printed on quotations and invoices)", () => {
  it("calcLineTotal multiplies quantity by unit price", () => {
    assert.equal(calcLineTotal(items[0]!), 1000);
    assert.equal(calcLineTotal(items[1]!), 250.5);
  });

  it("calcSubtotal sums all line totals", () => {
    assert.equal(calcSubtotal(items), 1250.5);
    assert.equal(calcSubtotal([]), 0);
  });

  it("calcTax applies the percentage", () => {
    assert.equal(calcTax(1000, 15), 150);
    assert.equal(calcTax(1000, 0), 0);
  });

  it("calcGrandTotal equals subtotal plus tax", () => {
    assert.equal(calcGrandTotal(items, 15), 1250.5 + 1250.5 * 0.15);
    assert.equal(calcGrandTotal(items, 0), 1250.5);
    assert.equal(calcGrandTotal([], 15), 0);
  });

  it("handles zero-quantity and zero-price items", () => {
    const zeroItems: LineItem[] = [
      { id: "1", description: "بند", quantity: 0, unitPrice: 100 },
      { id: "2", description: "بند", quantity: 3, unitPrice: 0 },
    ];
    assert.equal(calcSubtotal(zeroItems), 0);
    assert.equal(calcGrandTotal(zeroItems, 15), 0);
  });
});

describe("formatMoney", () => {
  it("formats currency for a deterministic locale", () => {
    assert.equal(formatMoney(1234.5, "USD", "en-US"), "$1,234.50");
  });

  it("falls back to 0 for NaN", () => {
    assert.equal(formatMoney(Number.NaN, "USD", "en-US"), "$0.00");
  });

  it("returns a non-empty string with USD defaults", () => {
    const formatted = formatMoney(100);
    assert.ok(formatted.length > 0);
  });
});
