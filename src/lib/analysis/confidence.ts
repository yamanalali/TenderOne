import type { AnalysisExtraction } from "@/lib/analysis/types";

/** Convert model confidence (0–1 or 0–100) into a stable 0–100 score. */
export function normalizeConfidence(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  if (value >= 0 && value <= 1) return Math.round(value * 100);
  return Math.max(0, Math.min(100, Math.round(value)));
}

function filled(value: string | null | undefined) {
  return Boolean(value && value.trim() && value.trim() !== "—");
}

/**
 * Heuristic confidence from how complete the extraction is.
 * Used as a floor so a model returning 0.9 (or empty headers) cannot look "done".
 */
export function scoreExtractionCompleteness(
  extracted: AnalysisExtraction,
): number {
  const info = extracted.tenderInfo || {};
  const submission = extracted.submissionMethod || {};

  const headerFields = [
    info.agency,
    info.referenceNumber,
    info.deadline,
    info.executionDuration,
    info.guarantees,
    info.currency,
    info.bidValidity,
  ];
  const headerScore =
    (headerFields.filter((f) => filled(f)).length / headerFields.length) * 40;

  const submissionSignals =
    Number(Boolean(submission.electronicPlatform)) +
    Number(Boolean(submission.email)) +
    Number(Boolean(submission.handDelivery)) +
    Number(filled(submission.deliveryAddress)) +
    Number(filled(submission.specialInstructions)) +
    Number(filled(submission.platformUrl)) +
    Number(filled(submission.contactEmail));
  const submissionScore = Math.min(20, submissionSignals * 5);

  const checklistCount =
    (extracted.documents?.length || 0) +
    (extracted.experience?.length || 0) +
    (extracted.staff?.length || 0) +
    (extracted.equipment?.length || 0) +
    (extracted.samples?.length || 0) +
    (extracted.certificates?.length || 0) +
    (extracted.guarantees?.length || 0) +
    (extracted.rejectionRisks?.length || 0) +
    (extracted.specialConditions?.length || 0);
  const checklistScore = Math.min(30, checklistCount * 2);

  const summaryScore = filled(extracted.summary) ? 10 : 0;

  return Math.round(
    headerScore + submissionScore + checklistScore + summaryScore,
  );
}

/** Prefer model confidence when sane; otherwise fall back to completeness. */
export function resolveConfidence(
  extracted: AnalysisExtraction,
  modelConfidence?: number,
): number {
  const normalized = normalizeConfidence(
    modelConfidence ?? extracted.confidence,
  );
  const completeness = scoreExtractionCompleteness(extracted);
  if (normalized == null) return completeness;
  // If the model is wildly optimistic while headers are empty, temper it.
  if (normalized - completeness > 35) {
    return Math.round((normalized + completeness) / 2);
  }
  return normalized;
}
