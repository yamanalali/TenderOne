/**
 * Analysis workflow entrypoint.
 * Designed to map to Vercel Workflows/Queues in production.
 */
import { after } from "next/server";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";

export async function analyzeTenderDocumentWorkflow(analysisId: string) {
  return runAnalysisPipeline(analysisId);
}

export async function enqueueAnalysis(analysisId: string) {
  after(async () => {
    try {
      await analyzeTenderDocumentWorkflow(analysisId);
    } catch (error) {
      console.error("Analysis workflow failed", analysisId, error);
    }
  });
}
