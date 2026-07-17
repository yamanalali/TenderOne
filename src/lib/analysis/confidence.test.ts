import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeConfidence,
  resolveConfidence,
  scoreExtractionCompleteness,
} from "@/lib/analysis/confidence";
import type { AnalysisExtraction } from "@/lib/analysis/types";

const emptyExtraction = (): AnalysisExtraction => ({
  tenderInfo: {},
  submissionMethod: {},
  documents: [],
  experience: [],
  staff: [],
  equipment: [],
  samples: [],
  certificates: [],
  guarantees: [],
  rejectionRisks: [],
  specialConditions: [],
  confidence: undefined,
});

describe("normalizeConfidence", () => {
  it("maps 0-1 fractions to percent", () => {
    assert.equal(normalizeConfidence(0.9), 90);
    assert.equal(normalizeConfidence(0), 0);
    assert.equal(normalizeConfidence(1), 100);
  });

  it("clamps 0-100 values", () => {
    assert.equal(normalizeConfidence(88), 88);
    assert.equal(normalizeConfidence(150), 100);
    assert.equal(normalizeConfidence(-3), 0);
  });

  it("returns undefined for non-numbers", () => {
    assert.equal(normalizeConfidence(undefined), undefined);
    assert.equal(normalizeConfidence("90"), undefined);
  });
});

describe("scoreExtractionCompleteness", () => {
  it("scores higher when headers and checklist are filled", () => {
    const weak = emptyExtraction();
    const strong: AnalysisExtraction = {
      ...emptyExtraction(),
      tenderInfo: {
        agency: "وزارة",
        referenceNumber: "T-1",
        deadline: "2026-08-01",
        executionDuration: "6 أشهر",
        guarantees: "10%",
        currency: "USD",
        bidValidity: "30 يوم",
      },
      submissionMethod: {
        electronicPlatform: true,
        specialInstructions: "عبر المنصة",
      },
      documents: [
        { title: "ملحق 1", details: null, pageNumber: 1, required: true },
        { title: "ملحق 2", details: null, pageNumber: 2, required: true },
      ],
      experience: [
        { title: "مشروع مشابه", details: "خلال 3 سنوات", pageNumber: 3, required: true },
      ],
      certificates: [
        { title: "ضريبة", details: null, pageNumber: 4, required: true },
      ],
      guarantees: [
        { title: "ضمان عرض", details: "3%", pageNumber: 1, required: true },
      ],
      summary: "ملخص واضح",
    };

    assert.ok(scoreExtractionCompleteness(strong) > scoreExtractionCompleteness(weak));
    assert.ok(scoreExtractionCompleteness(strong) >= 65);
  });
});

describe("resolveConfidence", () => {
  it("converts fractional model confidence like 0.9 to 90", () => {
    const extracted = emptyExtraction();
    extracted.documents = [
      { title: "وثيقة", details: null, pageNumber: 1, required: true },
    ];
    const score = resolveConfidence(extracted, 0.9);
    assert.ok(score >= 40);
    assert.ok(score <= 100);
  });

  it("tempers overconfident empty extractions", () => {
    const extracted = emptyExtraction();
    const score = resolveConfidence(extracted, 95);
    assert.ok(score < 95);
  });
});
