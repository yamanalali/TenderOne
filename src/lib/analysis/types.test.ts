import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analysisExtractionSchema } from "@/lib/analysis/types";

describe("analysisExtractionSchema", () => {
  it("accepts a valid extraction payload", () => {
    const parsed = analysisExtractionSchema.parse({
      tenderInfo: {
        agency: "وزارة",
        referenceNumber: "T-1",
        deadline: "2026-08-01",
        executionDuration: "6 أشهر",
        guarantees: "1%",
        currency: "SAR",
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
});
