import { eq } from "drizzle-orm";
import { after } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { assertCompanyAccess } from "@/lib/permissions";

const STALE_AFTER_MS = 120_000;
export const maxDuration = 300;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const { id } = await context.params;

  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, id))
    .limit(1);

  if (!analysis) {
    return NextResponse.json({ error: "التحليل غير موجود" }, { status: 404 });
  }
  assertCompanyAccess(session, analysis.companyId);

  if (analysis.status === "completed" || analysis.status === "failed") {
    return NextResponse.json({ resumed: false, status: analysis.status });
  }

  const stale =
    analysis.status === "queued" ||
    Date.now() - analysis.updatedAt.getTime() >= STALE_AFTER_MS;

  if (!stale) {
    return NextResponse.json({
      resumed: false,
      status: analysis.status,
      progress: analysis.progress,
    });
  }

  // Run one small (five-page) batch in this authenticated request.
  const result = await runAnalysisPipeline(id);

  // Continue remaining batches from the same proven origin.
  if (result.continued) {
    after(async () => {
      try {
        const processUrl = new URL(
          `/api/analyses/${id}/process`,
          request.url,
        ).toString();
        await fetch(processUrl, {
          method: "POST",
          headers: {
            "x-internal-secret": process.env.AUTH_SECRET || "dev-secret",
          },
          cache: "no-store",
        });
      } catch (error) {
        console.error("Failed to continue resumed analysis", id, error);
      }
    });
  }

  return NextResponse.json({
    resumed: true,
    continued: result.continued,
    progress: result.progress,
  });
}
