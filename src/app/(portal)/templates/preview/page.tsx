import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { listActiveProducts } from "@/app/actions/payments";
import { DocumentCanvas } from "@/components/documents/DocumentCanvas";
import { Button } from "@/components/ui/button";
import {
  createPreviewContent,
  DOCUMENT_TEMPLATES,
  getDocumentTemplate,
} from "@/lib/documents/registry";

export default async function TemplatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateKey } = await searchParams;
  if (!templateKey || !DOCUMENT_TEMPLATES.some((t) => t.key === templateKey)) {
    notFound();
  }

  const template = getDocumentTemplate(templateKey);
  const content = createPreviewContent(template.type);
  const products = await listActiveProducts();
  const documentsPack = products.find((product) => {
    const metadata = product.metadata as { serviceCode?: string } | null;
    return metadata?.serviceCode === "documents_pack";
  });
  const paymentsHref = documentsPack
    ? `/payments?productId=${documentsPack.id}`
    : "/payments";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-700">
            <LockKeyhole className="h-4 w-4" />
            معاينة تجريبية فقط
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#071426]">
            {template.nameAr}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            البيانات المعروضة وهمية. اشترِ الباقة لتعبئة بياناتك وحفظ المستند.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/templates">
            <Button variant="outline">العودة للقوالب</Button>
          </Link>
          <Link href={paymentsHref}>
            <Button>شراء وتفعيل</Button>
          </Link>
        </div>
      </div>

      <div className="relative overflow-auto rounded-3xl border border-slate-200 bg-slate-100/80 p-4 md:p-6">
        <DocumentCanvas content={content} template={template} language="ar" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <p className="-rotate-12 select-none text-6xl font-black text-slate-900/[0.06] md:text-8xl">
            معاينة فقط
          </p>
        </div>
      </div>
    </div>
  );
}
