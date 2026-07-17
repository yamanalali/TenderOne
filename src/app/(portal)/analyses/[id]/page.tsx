import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CircleGauge,
  Clock3,
  FileCheck2,
  FileText,
  Globe2,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { getAnalysisDetail } from "@/app/actions/analyses";
import { AnalysisPoller } from "@/components/analysis-poller";
import { ChecklistToggle } from "@/components/checklist-toggle";
import { RetryAnalysisButton } from "@/components/retry-analysis-button";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AnalysisExtraction } from "@/lib/analysis/types";
import {
  analysisStatusColor,
  analysisStatusLabel,
} from "@/lib/status-labels";
import { formatDate } from "@/lib/utils";

function InfoTile({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-teal-200 hover:bg-teal-50/30">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/70">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400">{label}</p>
          <p
            className="mt-1 break-words text-sm font-bold text-slate-800"
            dir={dir}
          >
            {value || "غير محدد"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MethodRow({
  icon: Icon,
  label,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span
        className={`inline-flex h-6 min-w-12 items-center justify-center rounded-full px-2 text-[10px] font-black ${
          enabled
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {enabled ? "متاح" : "غير متاح"}
      </span>
    </div>
  );
}

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
  const inProgress =
    analysis.status === "queued" || analysis.status === "processing";
  const rawConfidence = Number(
    extracted?.confidence ?? analysis.confidence ?? Number.NaN,
  );
  const confidence = Number.isNaN(rawConfidence)
    ? null
    : rawConfidence > 0 && rawConfidence <= 1
      ? Math.round(rawConfidence * 100)
      : Math.round(rawConfidence);
  const completedItems = items.filter((item) => item.isCompleted).length;
  const checklistProgress =
    items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <AnalysisPoller status={analysis.status} />
      <BackLink href="/analyses" label="رجوع إلى قائمة التحليلات" />

      <section className="relative overflow-hidden rounded-[2rem] bg-[#09182b] px-5 py-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.2),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(245,158,11,0.14),transparent_30%)]" />
        <div className="pointer-events-none absolute -end-12 -top-16 h-48 w-48 rounded-full border border-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-amber-300 shadow-inner">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className={analysisStatusColor[analysis.status]}>
                  {analysisStatusLabel[analysis.status] || analysis.status}
                </Badge>
                <span className="text-xs text-slate-400">
                  {formatDate(analysis.createdAt)}
                </span>
              </div>
              <h1 className="break-words text-xl font-black leading-relaxed sm:text-2xl">
                {analysis.fileName}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                تقرير تحليل ذكي لمتطلبات ووثائق المناقصة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400">درجة الثقة</p>
              <p className="mt-1 text-2xl font-black text-amber-300">
                {confidence == null ? "—" : `${confidence}%`}
              </p>
            </div>
            <div className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <p className="text-[10px] font-bold text-slate-400">المطلوبات</p>
              <p className="mt-1 text-2xl font-black text-teal-300">
                {items.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {inProgress && (
        <Card className="rounded-3xl border-amber-200 bg-gradient-to-l from-amber-50 to-white p-6 shadow-none">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <CircleGauge className="h-5 w-5 animate-pulse" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>جاري تحليل الملف</CardTitle>
                  <CardDescription>
                    نستخرج البيانات والمخاطر والمطلوبات، وستتحدث الصفحة تلقائياً.
                  </CardDescription>
                </div>
                <span className="text-lg font-black text-amber-700">
                  {analysis.progress}%
                </span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${Math.max(analysis.progress, 6)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {analysis.errorMessage && (
        <Card className="rounded-3xl border-rose-200 bg-rose-50 p-6 shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <CardTitle className="text-rose-900">تعذر إكمال التحليل</CardTitle>
                <CardDescription className="text-rose-700">
                  {analysis.errorMessage}
                </CardDescription>
              </div>
            </div>
            <RetryAnalysisButton analysisId={id} />
          </div>
        </Card>
      )}

      {extracted && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {extracted.summary && (
              <Card className="rounded-3xl border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>الملخص التنفيذي</CardTitle>
                    <CardDescription>أبرز ما ورد في ملف المناقصة</CardDescription>
                  </div>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-slate-700">
                  {extracted.summary}
                </p>
              </Card>
            )}

            <Card className="rounded-3xl border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>بيانات المناقصة المستخرجة</CardTitle>
                  <CardDescription>راجع الحقول قبل الاعتماد النهائي</CardDescription>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile
                  icon={Building2}
                  label="الجهة"
                  value={extracted.tenderInfo?.agency}
                />
                <InfoTile
                  icon={Hash}
                  label="رقم المناقصة"
                  value={extracted.tenderInfo?.referenceNumber}
                  dir="ltr"
                />
                <InfoTile
                  icon={CalendarDays}
                  label="آخر موعد"
                  value={extracted.tenderInfo?.deadline}
                />
                <InfoTile
                  icon={Clock3}
                  label="مدة التنفيذ"
                  value={extracted.tenderInfo?.executionDuration}
                />
                <InfoTile
                  icon={ShieldCheck}
                  label="الكفالات"
                  value={extracted.tenderInfo?.guarantees}
                />
                <InfoTile
                  icon={WalletCards}
                  label="العملة"
                  value={extracted.tenderInfo?.currency}
                />
                <InfoTile
                  icon={Clock3}
                  label="مدة سريان العرض"
                  value={extracted.tenderInfo?.bidValidity}
                />
              </div>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>قائمة المطلوبات</CardTitle>
                    <CardDescription>
                      {completedItems} مكتمل من أصل {items.length}
                    </CardDescription>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="min-w-40">
                    <div className="mb-1.5 flex justify-between text-[10px] font-bold text-slate-400">
                      <span>نسبة الإنجاز</span>
                      <span>{checklistProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all"
                        style={{ width: `${checklistProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
                    <FileCheck2 className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      {analysis.status === "completed"
                        ? "لم يتم العثور على مطلوبات في الملف"
                        : "ستظهر المطلوبات هنا بعد اكتمال التحليل"}
                    </p>
                  </div>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                      item.isCompleted
                        ? "border-emerald-100 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:border-teal-200"
                    }`}
                  >
                    <div className="pt-0.5">
                      <ChecklistToggle
                        itemId={item.id}
                        isCompleted={item.isCompleted}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p
                          className={`font-bold ${
                            item.isCompleted
                              ? "text-slate-500 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {item.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {item.section}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.isRequired
                                ? "bg-rose-50 text-rose-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {item.isRequired ? "مطلوب" : "اختياري"}
                          </span>
                        </div>
                      </div>
                      {item.details && (
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                          {item.details}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        الصفحة {item.pageNumber ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <Card className="rounded-3xl border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Send className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>طريقة التقديم</CardTitle>
                  <CardDescription>القنوات المذكورة في الملف</CardDescription>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <MethodRow
                  icon={Globe2}
                  label="منصة إلكترونية"
                  enabled={extracted.submissionMethod?.electronicPlatform}
                />
                <MethodRow
                  icon={Mail}
                  label="بريد إلكتروني"
                  enabled={extracted.submissionMethod?.email}
                />
                <MethodRow
                  icon={MapPin}
                  label="تسليم يدوي"
                  enabled={extracted.submissionMethod?.handDelivery}
                />
              </div>

              {extracted.submissionMethod?.deliveryAddress && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold text-slate-400">
                    عنوان التسليم
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                    {extracted.submissionMethod.deliveryAddress}
                  </p>
                </div>
              )}
              {extracted.submissionMethod?.specialInstructions && (
                <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-[10px] font-bold text-amber-700">
                    تعليمات خاصة
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    {extracted.submissionMethod.specialInstructions}
                  </p>
                </div>
              )}
            </Card>

            <Card className="rounded-3xl border-teal-100 bg-teal-50/60 p-5 shadow-none">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <div>
                  <p className="text-sm font-black text-teal-900">
                    مراجعة بشرية مطلوبة
                  </p>
                  <p className="mt-1 text-xs leading-6 text-teal-800/80">
                    النتائج مساعدة وتعتمد على محتوى الملف. راجع التواريخ
                    والكفالات والمطلوبات قبل تقديم العرض.
                  </p>
                </div>
              </div>
            </Card>

            {analysis.tenderId && (
              <Link href={`/tenders/${analysis.tenderId}`} className="block">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-slate-300 bg-white font-bold"
                >
                  <Landmark className="h-4 w-4" />
                  عرض المناقصة المرتبطة
                </Button>
              </Link>
            )}
          </aside>
        </div>
      )}

      {!extracted && analysis.tenderId && (
        <Link href={`/tenders/${analysis.tenderId}`}>
          <Button variant="outline">عرض المناقصة المرتبطة</Button>
        </Link>
      )}

      {!extracted && !inProgress && !analysis.errorMessage && (
        <Card className="rounded-3xl border-dashed p-10 text-center shadow-none">
          <FileText className="mx-auto h-9 w-9 text-slate-300" />
          <CardTitle className="mt-3">لا توجد نتائج بعد</CardTitle>
          <CardDescription>ستظهر بيانات التحليل هنا عند توفرها.</CardDescription>
        </Card>
      )}
    </div>
  );
}
