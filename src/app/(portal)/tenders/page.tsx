import Link from "next/link";
import { Suspense } from "react";
import {
  getDistinctAgenciesAndCities,
  listCategories,
  listPublishedTenders,
} from "@/app/actions/tenders";
import { TenderFilters } from "@/components/tender-filters";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getAppSettings } from "@/lib/settings";
import { computeTenderStatus, statusMeta } from "@/lib/tenders";
import { daysUntil, formatDate } from "@/lib/utils";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [rows, categories, distinct, settings] = await Promise.all([
    listPublishedTenders(params),
    listCategories(true),
    getDistinctAgenciesAndCities(),
    getAppSettings(),
  ]);

  const filtered = rows.filter((row) => {
    if (!params.status) return true;
    const status = computeTenderStatus(
      row.tender.deadlineAt,
      row.tender.publishedAt,
      settings.endingSoonDays,
      settings.newTenderDays,
    );
    return status === params.status;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">المناقصات</h1>
        <p className="mt-2 text-slate-600">
          تصفح المناقصات المنشورة مع الفلاتر والحالات وعدد الأيام المتبقية
        </p>
      </div>

      <Suspense fallback={<div>جاري تحميل الفلاتر...</div>}>
        <TenderFilters
          categories={categories}
          agencies={distinct.agencies}
          cities={distinct.cities}
        />
      </Suspense>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <Card>
            <CardTitle>لا توجد مناقصات مطابقة</CardTitle>
            <CardDescription className="mt-2">
              {Object.keys(params).some((key) => params[key])
                ? "جرّب تعديل الفلاتر أو امسحها لعرض كل المناقصات."
                : "لا توجد مناقصات منشورة حالياً. عد لاحقاً."}
            </CardDescription>
            {Object.keys(params).some((key) => params[key]) && (
              <Link href="/tenders" className="mt-4 inline-block">
                <span className="inline-flex h-11 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white">
                  مسح الفلاتر
                </span>
              </Link>
            )}
          </Card>
        )}
        {filtered.map(({ tender, categoryName }) => {
          const status = computeTenderStatus(
            tender.deadlineAt,
            tender.publishedAt,
            settings.endingSoonDays,
            settings.newTenderDays,
          );
          const remaining = daysUntil(tender.deadlineAt);
          const meta = statusMeta[status];

          return (
            <Link key={tender.id} href={`/tenders/${tender.id}`}>
              <Card className="transition hover:border-teal-300">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{tender.title}</CardTitle>
                    <CardDescription>
                      {tender.agency} — رقم {tender.referenceNumber}
                    </CardDescription>
                  </div>
                  <Badge className={meta.color}>
                    {meta.emoji} {meta.label}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                  <p>التصنيف: {categoryName || "—"}</p>
                  <p>المدينة: {tender.city || "—"}</p>
                  <p>تاريخ النشر: {formatDate(tender.publishedAt)}</p>
                  <p>آخر موعد: {formatDate(tender.deadlineAt)}</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-teal-800">
                  {remaining === null
                    ? "لا يوجد موعد محدد"
                    : remaining < 0
                      ? "انتهى موعد التقديم"
                      : `متبقي ${remaining} يوم للتقديم`}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
