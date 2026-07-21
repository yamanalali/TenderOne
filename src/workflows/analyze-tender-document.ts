/**
 * Analysis workflow entrypoint.
 * Uses chained /api/analyses/[id]/process calls for long PDFs.
 */
import { after } from "next/server";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";

function processUrl(analysisId: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  return `${base.replace(/\/$/, "")}/api/analyses/${analysisId}/process`;
}

export async function analyzeTenderDocumentWorkflow(analysisId: string) {
  return runAnalysisPipeline(analysisId);
}

/** Kick off (or continue) analysis on the dedicated process route. */
export async function enqueueAnalysis(analysisId: string) {
  after(async () => {
    try {
      const response = await fetch(processUrl(analysisId), {
        method: "POST",
        headers: {
          "x-internal-secret": process.env.AUTH_SECRET || "dev-secret",
        },
        cache: "no-store",
      });
      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Analysis process call failed",
          analysisId,
          response.status,
          text,
        );
      }
    } catch (error) {
      console.error("Analysis enqueue failed", analysisId, error);
    }
  });
}
