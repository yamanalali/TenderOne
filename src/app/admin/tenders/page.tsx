import { listAllTendersAdmin } from "@/app/actions/admin";
import { listCategories } from "@/app/actions/tenders";
import { TenderAdminForm } from "@/components/admin-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminTendersPage() {
  const [categories, rows] = await Promise.all([
    listCategories(false),
    listAllTendersAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">إدارة المناقصات</h1>
        <p className="mt-2 text-slate-600">إضافة ونشر ومتابعة المناقصات</p>
      </div>

      <TenderAdminForm
        categories={categories.map((c) => ({ id: c.id, nameAr: c.nameAr }))}
      />

      <div className="grid gap-3">
        {rows.map(({ tender, categoryName }) => (
          <Card key={tender.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{tender.title}</CardTitle>
                <CardDescription>
                  {tender.agency} — {tender.referenceNumber}
                </CardDescription>
              </div>
              <Badge
                className={
                  tender.isPublished
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }
              >
                {tender.isPublished ? "منشورة" : "مسودة"}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {categoryName || "بدون تصنيف"} — {formatDate(tender.deadlineAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
