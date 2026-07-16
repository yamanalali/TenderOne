import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, tenders } from "@/lib/db/schema";
import { getAppSettings } from "@/lib/settings";
import { computeTenderStatus, statusMeta } from "@/lib/tenders";
import { daysUntil, formatDate } from "@/lib/utils";

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [row] = await db
    .select({
      tender: tenders,
      categoryName: categories.nameAr,
    })
    .from(tenders)
    .leftJoin(categories, eq(categories.id, tenders.categoryId))
    .where(eq(tenders.id, id))
    .limit(1);

  if (!row || !row.tender.isPublished) notFound();

  const settings = await getAppSettings();
  const status = computeTenderStatus(
    row.tender.deadlineAt,
    row.tender.publishedAt,
    settings.endingSoonDays,
    settings.newTenderDays,
  );
  const remaining = daysUntil(row.tender.deadlineAt);
  const meta = statusMeta[status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">{row.tender.title}</h1>
          <p className="mt-2 text-slate-600">
            {row.tender.agency} — {row.tender.referenceNumber}
          </p>
        </div>
        <Badge className={meta.color}>
          {meta.emoji} {meta.label}
        </Badge>
      </div>

      <Card>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p>التصنيف: {row.categoryName || "—"}</p>
          <p>المدينة: {row.tender.city || "—"}</p>
          <p>تاريخ النشر: {formatDate(row.tender.publishedAt)}</p>
          <p>آخر موعد للتقديم: {formatDate(row.tender.deadlineAt)}</p>
          <p>تاريخ فتح العروض: {formatDate(row.tender.openingAt)}</p>
          <p>مدة التنفيذ: {row.tender.executionDuration || "—"}</p>
          <p>طريقة التسليم: {row.tender.deliveryMethod || "—"}</p>
          <p>مكان التسليم: {row.tender.deliveryPlace || "—"}</p>
          <p>البريد: {row.tender.contactEmail || "—"}</p>
          <p>
            الرابط:{" "}
            {row.tender.platformUrl ? (
              <a
                href={row.tender.platformUrl}
                className="text-teal-700 underline"
                target="_blank"
                rel="noreferrer"
              >
                فتح المنصة
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
        <p className="mt-4 font-semibold text-teal-800">
          {remaining === null
            ? "لا يوجد موعد محدد"
            : remaining < 0
              ? "انتهى موعد التقديم"
              : `متبقي ${remaining} يوم للتقديم`}
        </p>
        {row.tender.description && (
          <>
            <CardTitle className="mt-6">الوصف</CardTitle>
            <CardDescription className="mt-2 whitespace-pre-wrap text-slate-700">
              {row.tender.description}
            </CardDescription>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        {row.tender.documentUrl && (
          <a href={row.tender.documentUrl} target="_blank" rel="noreferrer">
            <Button variant="outline">عرض دفتر الشروط</Button>
          </a>
        )}
        <Link href={`/analyses/new?tenderId=${row.tender.id}`}>
          <Button>تحليل دفتر الشروط (خدمة مستقلة)</Button>
        </Link>
      </div>
    </div>
  );
}
