import Link from "next/link";
import { eq } from "drizzle-orm";
import { Eye, FileStack, FolderOpen } from "lucide-react";
import { getDocumentsPageData } from "@/app/actions/documents";
import { listActiveProducts } from "@/app/actions/payments";
import { CreateDocumentButton } from "@/components/documents/CreateDocumentButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireCompanySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { entitlements } from "@/lib/db/schema";
import {
  DOCUMENT_STYLE_META,
  DOCUMENT_TYPE_META,
} from "@/lib/documents/registry";
import type { DocumentType } from "@/lib/documents/types";

const TYPE_ORDER: DocumentType[] = [
  "company_profile",
  "quotation",
  "invoice",
  "service_brochure",
];

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: typeParam } = await searchParams;
  const selectedType = TYPE_ORDER.includes(typeParam as DocumentType)
    ? (typeParam as DocumentType)
    : undefined;

  const session = await requireCompanySession();
  const { templates, documents, accessByType } =
    await getDocumentsPageData(selectedType);
  const hasFullAccess = TYPE_ORDER.every((type) => accessByType[type]);

  const allProducts = await listActiveProducts();
  const products = allProducts.filter((p) => p.type === "template");
  const documentsPack = allProducts.find((product) => {
    const metadata = product.metadata as { serviceCode?: string } | null;
    return metadata?.serviceCode === "documents_pack";
  });
  const owned = session.companyId
    ? await db
        .select()
        .from(entitlements)
        .where(eq(entitlements.companyId, session.companyId))
    : [];
  const ownedProductIds = new Set(
    owned.filter((e) => e.type === "template" && e.isActive).map((e) => e.productId),
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[#071426] px-6 py-8 text-white md:px-9">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black text-amber-300">مكتبة العمليات</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              12 تصميماً مؤسسياً جاهزاً للعمل
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              بروفايل شركة، عرض سعر، فاتورة، وعرض خدمات — بثلاثة أساليب:
              رسمي، عصري، وفاخر. عدّل البيانات ثم اطبع أو احفظ PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/documents">
              <Button className="gap-2 bg-gradient-to-l from-amber-300 to-yellow-500 text-[#071426] hover:brightness-110">
                <FolderOpen className="h-4 w-4" />
                مستنداتي ({documents.length})
              </Button>
            </Link>
            {!hasFullAccess && (
              <Link
                href={
                  documentsPack
                    ? `/payments?productId=${documentsPack.id}`
                    : "/payments"
                }
              >
                <Button variant="outline" className="border-white/20 bg-white/5 text-white">
                  تفعيل الباقة
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/templates" active={!selectedType} label="الكل" />
        {TYPE_ORDER.map((type) => (
          <FilterChip
            key={type}
            href={`/templates?type=${type}`}
            active={selectedType === type}
            label={DOCUMENT_TYPE_META[type].nameAr}
          />
        ))}
      </div>

      {!hasFullAccess && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardTitle>المعاينة متاحة قبل الشراء</CardTitle>
          <CardDescription className="mt-2">
            افتح أي تصميم لمشاهدته ببيانات تجريبية. تعبئة البيانات والحفظ
            والطباعة لا تتاح إلا بعد شراء الخدمة المناسبة.
          </CardDescription>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => {
          const typeMeta = DOCUMENT_TYPE_META[template.type];
          const styleMeta = DOCUMENT_STYLE_META[template.style];
          const unlocked = accessByType[template.type];
          return (
            <div
              key={template.key}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
            >
              <div
                className="relative h-36 px-5 py-5 text-white"
                style={{
                  background: `linear-gradient(145deg, ${template.secondaryColor}, ${template.accentColor})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <Badge className="bg-white/15 text-white ring-1 ring-white/20">
                    {styleMeta.nameAr}
                  </Badge>
                  <FileStack className="h-4 w-4 text-white/70" />
                </div>
                <div className="absolute bottom-5 right-5 left-5">
                  <p className="text-[10px] font-black tracking-[0.2em] text-white/60">
                    {typeMeta.iconLabel}
                  </p>
                  <p className="mt-1 text-xl font-black">{typeMeta.nameAr}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-black text-[#071426]">
                  {template.nameAr}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {template.descriptionAr}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/templates/preview?template=${template.key}`}>
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      معاينة
                    </Button>
                  </Link>
                  {unlocked ? (
                    <CreateDocumentButton
                      templateKey={template.key}
                      title={typeMeta.nameAr}
                    />
                  ) : (
                    <Link
                      href={
                        documentsPack
                          ? `/payments?productId=${documentsPack.id}`
                          : "/payments"
                      }
                    >
                      <Button>شراء للتعبئة</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section id="downloads" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className="text-xl font-black text-[#071426]">ملفات جاهزة للتنزيل</h2>
          <p className="mt-1 text-sm text-slate-500">
            النماذج التشغيلية الكلاسيكية (Word/PDF) تبقى متاحة بشكل مستقل
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => {
            const unlocked = ownedProductIds.has(product.id);
            return (
              <Card key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{product.nameAr}</CardTitle>
                  <Badge
                    className={
                      unlocked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {unlocked ? "مفعّل" : "غير مفعّل"}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {product.descriptionAr}
                </CardDescription>
                <p className="mt-4 font-bold text-teal-800">
                  {product.price} {product.currency}
                </p>
                <div className="mt-4 flex gap-2">
                  {unlocked ? (
                    <Link href={`/templates/${product.id}/download`}>
                      <Button>تنزيل النموذج</Button>
                    </Link>
                  ) : (
                    <Link href={`/payments?productId=${product.id}`}>
                      <Button>شراء / تفعيل</Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-[#071426] px-4 py-2 text-xs font-black text-amber-300"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
      }
    >
      {label}
    </Link>
  );
}
