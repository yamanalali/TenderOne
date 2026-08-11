import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { assertCompanyAccess } from "@/lib/permissions";
import { enqueueAnalysis } from "@/workflows/analyze-tender-document";

const STALE_AFTER_MS = 120_000;

export async function POST(
  _request: Request,
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

  if (stale) {
    await enqueueAnalysis(id);
  }

  return NextResponse.json({
    resumed: stale,
    status: analysis.status,
    progress: analysis.progress,
  });
}
