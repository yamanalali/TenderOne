import { AnalysisCreateForm } from "@/components/analysis-create-form";
import { getMyAnalysisCredits } from "@/app/actions/analyses";

export default async function NewAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ tenderId?: string }>;
}) {
  const params = await searchParams;
  const credits = await getMyAnalysisCredits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">تحليل جديد</h1>
        <p className="mt-2 text-slate-600">
          ارفع ملف PDF وسيقوم النظام باستخراج المطلوبات وإنشاء Checklist
        </p>
      </div>
      <AnalysisCreateForm tenderId={params.tenderId} credits={credits} />
    </div>
  );
}
