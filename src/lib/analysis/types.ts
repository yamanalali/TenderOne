import { z } from "zod";

export const extractedItemSchema = z.object({
  title: z.string(),
  details: z.string().nullable().optional(),
  pageNumber: z.number().int().nullable().optional(),
  required: z.boolean().optional().default(true),
});

export const analysisExtractionSchema = z.object({
  tenderInfo: z.object({
    agency: z.string().nullable().optional(),
    referenceNumber: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
    executionDuration: z.string().nullable().optional(),
    guarantees: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    bidValidity: z.string().nullable().optional(),
  }),
  submissionMethod: z.object({
    electronicPlatform: z.boolean().optional(),
    email: z.boolean().optional(),
    handDelivery: z.boolean().optional(),
    deliveryAddress: z.string().nullable().optional(),
    specialInstructions: z.string().nullable().optional(),
    platformUrl: z.string().nullable().optional(),
    contactEmail: z.string().nullable().optional(),
  }),
  documents: z.array(extractedItemSchema).default([]),
  experience: z.array(extractedItemSchema).default([]),
  staff: z.array(extractedItemSchema).default([]),
  equipment: z.array(extractedItemSchema).default([]),
  samples: z.array(extractedItemSchema).default([]),
  certificates: z.array(extractedItemSchema).default([]),
  guarantees: z.array(extractedItemSchema).default([]),
  rejectionRisks: z.array(extractedItemSchema).default([]),
  specialConditions: z.array(extractedItemSchema).default([]),
  confidence: z.preprocess((value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return undefined;
    // Models sometimes return 0.9 instead of 90.
    if (value >= 0 && value <= 1) return Math.round(value * 100);
    return Math.max(0, Math.min(100, Math.round(value)));
  }, z.number().min(0).max(100).optional()),
  summary: z.string().nullable().optional(),
});

export type AnalysisExtraction = z.infer<typeof analysisExtractionSchema>;

export const SECTION_LABELS: Record<string, string> = {
  documents: "الوثائق",
  experience: "الخبرات",
  staff: "الكادر",
  equipment: "المعدات",
  samples: "العينات",
  certificates: "الشهادات",
  guarantees: "الكفالات",
  rejectionRisks: "أسباب الرفض المحتملة",
  specialConditions: "شروط خاصة",
};
