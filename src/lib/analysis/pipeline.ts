import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyses, checklistItems } from "@/lib/db/schema";
import { analyzePdfWithOpenAI } from "@/lib/analysis/openai";
import {
  SECTION_LABELS,
  type AnalysisExtraction,
} from "@/lib/analysis/types";

export async function runAnalysisPipeline(analysisId: string) {
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisId))
    .limit(1);

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  await db
    .update(analyses)
    .set({ status: "processing", progress: 10, updatedAt: new Date() })
    .where(eq(analyses.id, analysisId));

  try {
    await db
      .update(analyses)
      .set({ progress: 35, updatedAt: new Date() })
      .where(eq(analyses.id, analysisId));

    const extracted = await analyzePdfWithOpenAI({
      fileUrl: analysis.fileUrl,
      fileName: analysis.fileName,
      onProgress: async (progress) => {
        await db
          .update(analyses)
          .set({ progress, updatedAt: new Date() })
          .where(eq(analyses.id, analysisId));
      },
    });

    await db
      .update(analyses)
      .set({ progress: 90, updatedAt: new Date() })
      .where(eq(analyses.id, analysisId));

    await persistChecklist(analysisId, extracted);

    await db
      .update(analyses)
      .set({
        status: "completed",
        progress: 100,
        extractedData: extracted,
        confidence: String(extracted.confidence ?? 70),
        completedAt: new Date(),
        updatedAt: new Date(),
        errorMessage: null,
      })
      .where(eq(analyses.id, analysisId));

    return extracted;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل تحليل الملف";
    await db
      .update(analyses)
      .set({
        status: "failed",
        progress: 100,
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, analysisId));
    throw error;
  }
}

async function persistChecklist(
  analysisId: string,
  extracted: AnalysisExtraction,
) {
  await db.delete(checklistItems).where(eq(checklistItems.analysisId, analysisId));

  const rows: Array<typeof checklistItems.$inferInsert> = [];
  let sortOrder = 0;

  for (const [section, items] of Object.entries({
    documents: extracted.documents,
    experience: extracted.experience,
    staff: extracted.staff,
    equipment: extracted.equipment,
    samples: extracted.samples,
    certificates: extracted.certificates,
    guarantees: extracted.guarantees,
    rejectionRisks: extracted.rejectionRisks,
    specialConditions: extracted.specialConditions,
  })) {
    for (const item of items) {
      rows.push({
        analysisId,
        section: SECTION_LABELS[section] || section,
        title: item.title,
        details: item.details ?? null,
        pageNumber: item.pageNumber ?? null,
        isRequired: item.required ?? true,
        isCompleted: false,
        sortOrder: sortOrder++,
      });
    }
  }

  if (rows.length) {
    await db.insert(checklistItems).values(rows);
  }
}
