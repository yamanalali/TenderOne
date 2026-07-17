import Link from "next/link";
import { FileStack } from "lucide-react";
import { getDocumentsPageData } from "@/app/actions/documents";
import { listActiveProducts } from "@/app/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  DOCUMENT_STYLE_META,
  DOCUMENT_TYPE_META,
} from "@/lib/documents/registry";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const [{ documents, hasAccess }, products] = await Promise.all([
    getDocumentsPageData(),
    listActiveProducts(),
  ]);
  const documentsPack = products.find((product) => {
    const metadata = product.metadata as { serviceCode?: string } | null;
    return metadata?.serviceCode === "documents_pack";
  });
  const paymentsHref = documentsPack
    ? `/payments?productId=${documentsPack.id}`
    : "/payments";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black text-amber-600">مستنداتك</p>
          <h1 className="mt-1 text-3xl font-black text-[#071426]">
            المستندات المحفوظة
          </h1>
          <p className="mt-2 text-slate-600">
            جميع البروفايلات وعروض الأسعار والفواتير وعروض الخدمات
          </p>
        </div>
        <Link href="/templates">
          <Button className="gap-2">
            <FileStack className="h-4 w-4" />
            معرض التصاميم
          </Button>
        </Link>
      </div>

      {!hasAccess && (
        <Card>
          <CardTitle>الباقة غير مفعّلة</CardTitle>
          <CardDescription className="mt-2">
            فعّل باقة النماذج المؤسسية من صفحة الدفع لإنشاء مستندات جديدة.
          </CardDescription>
          <Link href={paymentsHref} className="mt-4 inline-block">
            <Button>تفعيل الباقة الآن</Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.length === 0 && (
          <Card>
            <CardTitle>لا توجد مستندات بعد</CardTitle>
            <CardDescription className="mt-2">
              اختر تصميماً من المعرض لإنشاء أول مستند.
            </CardDescription>
            <Link href="/templates" className="mt-4 inline-block">
              <Button variant="outline">الذهاب لمعرض التصاميم</Button>
            </Link>
          </Card>
        )}
        {documents.map((doc) => (
          <Link key={doc.id} href={`/documents/${doc.id}`}>
            <Card className="transition hover:border-amber-300/60">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{doc.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {DOCUMENT_TYPE_META[doc.type].nameAr} —{" "}
                    {DOCUMENT_STYLE_META[doc.style].nameAr} —{" "}
                    {formatDate(doc.updatedAt)}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    doc.status === "final"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {doc.status === "final" ? "نهائي" : "مسودة"}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
