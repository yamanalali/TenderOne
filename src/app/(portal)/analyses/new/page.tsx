import { AnalysisCreateForm } from "@/components/analysis-create-form";
import { getMyAnalysisCredits } from "@/app/actions/analyses";
import { listActiveProducts } from "@/app/actions/payments";
import { BackLink } from "@/components/ui/back-link";
import { paymentsHrefForType } from "@/lib/product-destination";

export default async function NewAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ tenderId?: string }>;
}) {
  const params = await searchParams;
  const [credits, products] = await Promise.all([
    getMyAnalysisCredits(),
    listActiveProducts(),
  ]);
  const paymentsHref = paymentsHrefForType(products, "analysis_credit");

  return (
    <div className="space-y-6">
      <BackLink href="/analyses" label="رجوع إلى قائمة التحليلات" />
      <div>
        <h1 className="text-3xl font-black">تحليل جديد</h1>
        <p className="mt-2 text-slate-600">
          ارفع ملف PDF وسيقوم النظام باستخراج المطلوبات وإنشاء Checklist
        </p>
      </div>
      <AnalysisCreateForm
        tenderId={params.tenderId}
        credits={credits}
        paymentsHref={paymentsHref}
      />
    </div>
  );
}
