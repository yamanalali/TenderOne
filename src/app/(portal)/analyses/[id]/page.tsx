import { notFound } from "next/navigation";
import { getAnalysisDetail } from "@/app/actions/analyses";
import { AnalysisPoller } from "@/components/analysis-poller";
import { ChecklistToggle } from "@/components/checklist-toggle";
import { RetryAnalysisButton } from "@/components/retry-analysis-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AnalysisExtraction } from "@/lib/analysis/types";
import { formatDate } from "@/lib/utils";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAnalysisDetail(id);
  if (!detail) notFound();

  const { analysis, items } = detail;
  const extracted = (analysis.extractedData || null) as AnalysisExtraction | null;

  return (
    <div className="space-y-6">
      <AnalysisPoller status={analysis.status} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">{analysis.fileName}</h1>
          <p className="mt-2 text-slate-600">
            {formatDate(analysis.createdAt)} — التقدم {analysis.progress}%
          </p>
        </div>
        <Badge
          className={
            analysis.status === "completed"
              ? "bg-emerald-100 text-emerald-800"
              : analysis.status === "failed"
                ? "bg-rose-100 text-rose-800"
                : "bg-amber-100 text-amber-800"
          }
        >
          {analysis.status}
        </Badge>
      </div>

      {analysis.errorMessage && (
        <Card className="border-rose-200 bg-rose-50">
          <CardTitle>فشل التحليل</CardTitle>
          <CardDescription className="text-rose-700">
            {analysis.errorMessage}
          </CardDescription>
          <div className="mt-4">
            <RetryAnalysisButton analysisId={id} />
          </div>
        </Card>
      )}

      {extracted && (
        <>
          <Card>
            <CardTitle>معلومات المناقصة المستخرجة</CardTitle>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <p>الجهة: {extracted.tenderInfo?.agency || "—"}</p>
              <p>رقم المناقصة: {extracted.tenderInfo?.referenceNumber || "—"}</p>
              <p>آخر موعد: {extracted.tenderInfo?.deadline || "—"}</p>
              <p>مدة التنفيذ: {extracted.tenderInfo?.executionDuration || "—"}</p>
              <p>الكفالات: {extracted.tenderInfo?.guarantees || "—"}</p>
              <p>العملة: {extracted.tenderInfo?.currency || "—"}</p>
              <p>مدة سريان العرض: {extracted.tenderInfo?.bidValidity || "—"}</p>
              <p>درجة الثقة: {extracted.confidence ?? analysis.confidence}%</p>
            </div>
          </Card>

          <Card>
            <CardTitle>طريقة التقديم</CardTitle>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <p>
                منصة إلكترونية:{" "}
                {extracted.submissionMethod?.electronicPlatform ? "نعم" : "لا"}
              </p>
              <p>بريد إلكتروني: {extracted.submissionMethod?.email ? "نعم" : "لا"}</p>
              <p>
                تسليم يدوي:{" "}
                {extracted.submissionMethod?.handDelivery ? "نعم" : "لا"}
              </p>
              <p>
                عنوان التسليم:{" "}
                {extracted.submissionMethod?.deliveryAddress || "—"}
              </p>
              <p className="md:col-span-2">
                تعليمات خاصة:{" "}
                {extracted.submissionMethod?.specialInstructions || "—"}
              </p>
            </div>
          </Card>

          {extracted.summary && (
            <Card>
              <CardTitle>ملخص</CardTitle>
              <CardDescription className="mt-2 whitespace-pre-wrap text-slate-700">
                {extracted.summary}
              </CardDescription>
              <p className="mt-3 text-xs text-slate-500">
                النتائج مساعدة وتتطلب مراجعة بشرية قبل الاعتماد.
              </p>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardTitle>Checklist المطلوبات</CardTitle>
        <CardDescription>
          يتم إنشاؤها تلقائياً من بنود الملف مع أرقام الصفحات
        </CardDescription>
        <div className="mt-4 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-slate-500">
              {analysis.status === "completed"
                ? "لا توجد بنود"
                : "سيتم إنشاء القائمة بعد اكتمال التحليل"}
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
            >
              <ChecklistToggle itemId={item.id} isCompleted={item.isCompleted} />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  [{item.section}] {item.title}
                </p>
                {item.details && (
                  <p className="mt-1 text-sm text-slate-600">{item.details}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  الصفحة: {item.pageNumber ?? "—"}{" "}
                  {item.isRequired ? "• مطلوب" : "• اختياري"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
