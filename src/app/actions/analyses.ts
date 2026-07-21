"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
import { requireCompanySession, requireSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { analyses, analysisFiles, checklistItems } from "@/lib/db/schema";
import {
  assertCompanyAccess,
  consumeAnalysisCredit,
  getAnalysisCredits,
  isSystemAdmin,
} from "@/lib/permissions";
import { enqueueAnalysis } from "@/workflows/analyze-tender-document";
import type { ActionState } from "@/app/actions/auth";

type UploadedAnalysisFile = {
  fileName: string;
  fileUrl: string;
  filePathname: string;
};

function parseUploadedFiles(formData: FormData): UploadedAnalysisFile[] {
  const raw = String(formData.get("filesJson") || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as UploadedAnalysisFile[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (file) => file?.fileName && file?.fileUrl && file?.filePathname,
        );
      }
    } catch {
      // fall through to legacy single-file fields
    }
  }

  const fileName = String(formData.get("fileName") || "");
  const fileUrl = String(formData.get("fileUrl") || "");
  const filePathname = String(formData.get("filePathname") || "");
  if (fileName && fileUrl && filePathname) {
    return [{ fileName, fileUrl, filePathname }];
  }
  return [];
}

export async function createAnalysisAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) {
    return { error: "يجب ربط حسابك بشركة أولاً" };
  }

  const files = parseUploadedFiles(formData);
  const tenderId = String(formData.get("tenderId") || "") || null;

  if (files.length === 0) {
    return { error: "يرجى رفع ملف PDF واحد على الأقل" };
  }
  if (files.some((file) => file.fileUrl.startsWith("blob:"))) {
    return {
      error:
        "تعذر تجهيز الملف للتحليل الحقيقي. أعد رفعه وانتظر اكتمال التجهيز قبل بدء التحليل.",
    };
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

  const primary = files[0]!;
  const displayName =
    files.length === 1
      ? primary.fileName
      : `${primary.fileName} (+${files.length - 1})`;

  const [row] = await db
    .insert(analyses)
    .values({
      companyId: session.companyId,
      createdById: session.user.id,
      tenderId,
      fileName: displayName,
      fileUrl: primary.fileUrl,
      filePathname: primary.filePathname,
      status: "queued",
      progress: 0,
    })
    .returning();

  await db.insert(analysisFiles).values(
    files.map((file, index) => ({
      analysisId: row.id,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      filePathname: file.filePathname,
      sortOrder: index,
    })),
  );

  await writeAuditLog({
    actorId: session.user.id,
    action: "analysis.create",
    entityType: "analysis",
    entityId: row.id,
    metadata: { fileCount: files.length },
  });

  await enqueueAnalysis(row.id);

  revalidatePath("/analyses");
  return {
    success: "بدأ التحليل بنجاح",
    redirectTo: `/analyses/${row.id}`,
  };
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
      extractedData: null,
      completedAt: null,
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

  const [items, files] = await Promise.all([
    db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.analysisId, analysisId))
      .orderBy(checklistItems.sortOrder),
    db
      .select()
      .from(analysisFiles)
      .where(eq(analysisFiles.analysisId, analysisId))
      .orderBy(asc(analysisFiles.sortOrder)),
  ]);

  const credits = session.companyId
    ? await getAnalysisCredits(session.companyId)
    : 0;

  return { analysis, items, files, credits };
}

export async function getMyAnalysisCredits() {
  const session = await requireCompanySession();
  if (!session.companyId) return 0;
  return getAnalysisCredits(session.companyId);
}
