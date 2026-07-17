import Link from "next/link";
import {
  getMyAnalysisCredits,
  listCompanyAnalyses,
} from "@/app/actions/analyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  analysisStatusColor,
  analysisStatusLabel,
} from "@/lib/status-labels";
import { formatDate } from "@/lib/utils";

export default async function AnalysesPage() {
  const [rows, credits] = await Promise.all([
    listCompanyAnalyses(),
    getMyAnalysisCredits(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">تحليل دفتر الشروط</h1>
          <p className="mt-2 text-slate-600">
            خدمة مستقلة — رصيدك المتاح: {credits}
          </p>
        </div>
        <Link href="/analyses/new">
          <Button>تحليل ملف جديد</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {rows.length === 0 && (
          <Card>
            <CardTitle>لا توجد تحليلات بعد</CardTitle>
            <CardDescription className="mt-2">
              ارفع أي ملف PDF لدفتر شروط لبدء أول تحليل
            </CardDescription>
            <Link href="/analyses/new" className="mt-4 inline-block">
              <Button>ابدأ تحليل الآن</Button>
            </Link>
          </Card>
        )}
        {rows.map((row) => (
          <Link key={row.id} href={`/analyses/${row.id}`}>
            <Card className="transition hover:border-amber-300/60">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{row.fileName}</CardTitle>
                  <CardDescription>{formatDate(row.createdAt)}</CardDescription>
                </div>
                <Badge className={analysisStatusColor[row.status]}>
                  {analysisStatusLabel[row.status] || row.status}
                </Badge>
              </div>
              {(row.status === "queued" || row.status === "processing") && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>التقدم</span>
                    <span>{row.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${Math.max(row.progress, 4)}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
