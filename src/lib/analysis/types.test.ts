import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SECTION_LABELS,
  analysisExtractionSchema,
} from "@/lib/analysis/types";

describe("analysisExtractionSchema", () => {
  it("accepts a valid extraction payload", () => {
    const parsed = analysisExtractionSchema.parse({
      tenderInfo: {
        agency: "وزارة",
        referenceNumber: "T-1",
        deadline: "2026-08-01",
        executionDuration: "6 أشهر",
        guarantees: "1%",
        currency: "USD",
        bidValidity: "90",
      },
      submissionMethod: {
        electronicPlatform: true,
        email: false,
        handDelivery: true,
        deliveryAddress: "الرياض",
        specialInstructions: null,
        platformUrl: null,
        contactEmail: null,
      },
      documents: [
        { title: "سجل تجاري", details: null, pageNumber: 2, required: true },
      ],
      experience: [],
      staff: [],
      equipment: [],
      samples: [],
      certificates: [],
      guarantees: [],
      rejectionRisks: [],
      specialConditions: [],
      confidence: 88,
      summary: "ملخص",
    });

    assert.equal(parsed.documents.length, 1);
    assert.equal(parsed.confidence, 88);
  });

  it("defaults missing arrays to empty and required to true", () => {
    const parsed = analysisExtractionSchema.parse({
      tenderInfo: {},
      submissionMethod: {},
      documents: [{ title: "وثيقة" }],
    });

    assert.deepEqual(parsed.experience, []);
    assert.deepEqual(parsed.staff, []);
    assert.deepEqual(parsed.equipment, []);
    assert.deepEqual(parsed.samples, []);
    assert.deepEqual(parsed.certificates, []);
    assert.deepEqual(parsed.guarantees, []);
    assert.deepEqual(parsed.rejectionRisks, []);
    assert.deepEqual(parsed.specialConditions, []);
    assert.equal(parsed.documents[0]?.required, true);
  });

  it("normalizes fractional confidence like 0.9 to 90", () => {
    const parsed = analysisExtractionSchema.parse({
      tenderInfo: {},
      submissionMethod: {},
      confidence: 0.9,
    });
    assert.equal(parsed.confidence, 90);
  });

  it("clamps confidence outside 0-100", () => {
    const high = analysisExtractionSchema.parse({
      tenderInfo: {},
      submissionMethod: {},
      confidence: 101,
    });
    const low = analysisExtractionSchema.parse({
      tenderInfo: {},
      submissionMethod: {},
      confidence: -1,
    });
    assert.equal(high.confidence, 100);
    assert.equal(low.confidence, 0);
  });
});

describe("SECTION_LABELS", () => {
  it("covers all pipeline section keys", () => {
    const expected = [
      "documents",
      "experience",
      "staff",
      "equipment",
      "samples",
      "certificates",
      "guarantees",
      "rejectionRisks",
      "specialConditions",
    ];

    for (const key of expected) {
      assert.ok(SECTION_LABELS[key], `missing SECTION_LABELS.${key}`);
    }
    assert.equal(Object.keys(SECTION_LABELS).length, expected.length);
  });
});
