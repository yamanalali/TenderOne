"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { requireCompanySession, requireSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { analyses, checklistItems } from "@/lib/db/schema";
import {
  assertCompanyAccess,
  consumeAnalysisCredit,
  getAnalysisCredits,
  isSystemAdmin,
} from "@/lib/permissions";
import { enqueueAnalysis } from "@/workflows/analyze-tender-document";
import type { ActionState } from "@/app/actions/auth";

export async function createAnalysisAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) {
    return { error: "يجب ربط حسابك بشركة أولاً" };
  }

  const fileName = String(formData.get("fileName") || "");
  const fileUrl = String(formData.get("fileUrl") || "");
  const filePathname = String(formData.get("filePathname") || "");
  const tenderId = String(formData.get("tenderId") || "") || null;

  if (!fileName || !fileUrl || !filePathname) {
    return { error: "يرجى رفع ملف PDF أولاً" };
  }

  try {
    if (!isSystemAdmin(session)) {
      await consumeAnalysisCredit(session.companyId);
    }
  } catch {
    return {
      error:
        "لا يوجد رصيد تحليل متاح. اشترِ خدمة التحليل من صفحة الدفع ثم أعد المحاولة.",
    };
  }

  const [row] = await db
    .insert(analyses)
    .values({
      companyId: session.companyId,
      createdById: session.user.id,
      tenderId,
      fileName,
      fileUrl,
      filePathname,
      status: "queued",
      progress: 0,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "analysis.create",
    entityType: "analysis",
    entityId: row.id,
  });

  await enqueueAnalysis(row.id);

  revalidatePath("/analyses");
  return { success: row.id };
}

export async function retryAnalysisAction(analysisId: string): Promise<ActionState> {
  const session = await requireCompanySession();
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisId))
    .limit(1);

  if (!analysis) return { error: "التحليل غير موجود" };
  assertCompanyAccess(session, analysis.companyId);

  await db
    .update(analyses)
    .set({
      status: "queued",
      progress: 0,
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(analyses.id, analysisId));

  await enqueueAnalysis(analysisId);
  revalidatePath(`/analyses/${analysisId}`);
  return { success: "تمت إعادة تشغيل التحليل" };
}

export async function toggleChecklistItemAction(
  itemId: string,
  isCompleted: boolean,
) {
  const session = await requireSession();
  const [item] = await db
    .select({
      item: checklistItems,
      analysis: analyses,
    })
    .from(checklistItems)
    .innerJoin(analyses, eq(analyses.id, checklistItems.analysisId))
    .where(eq(checklistItems.id, itemId))
    .limit(1);

  if (!item) throw new Error("NOT_FOUND");
  assertCompanyAccess(session, item.analysis.companyId);

  await db
    .update(checklistItems)
    .set({ isCompleted })
    .where(eq(checklistItems.id, itemId));

  revalidatePath(`/analyses/${item.analysis.id}`);
}

export async function listCompanyAnalyses() {
  const session = await requireCompanySession();
  if (!session.companyId) return [];

  return db
    .select()
    .from(analyses)
    .where(eq(analyses.companyId, session.companyId))
    .orderBy(desc(analyses.createdAt));
}

export async function getAnalysisDetail(analysisId: string) {
  const session = await requireSession();
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisId))
    .limit(1);

  if (!analysis) return null;
  assertCompanyAccess(session, analysis.companyId);

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.analysisId, analysisId))
    .orderBy(checklistItems.sortOrder);

  const credits = session.companyId
    ? await getAnalysisCredits(session.companyId)
    : 0;

  return { analysis, items, credits };
}

export async function getMyAnalysisCredits() {
  const session = await requireCompanySession();
  if (!session.companyId) return 0;
  return getAnalysisCredits(session.companyId);
}
