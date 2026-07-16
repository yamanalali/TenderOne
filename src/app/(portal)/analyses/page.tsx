import Link from "next/link";
import {
  getMyAnalysisCredits,
  listCompanyAnalyses,
} from "@/app/actions/analyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  queued: "في الانتظار",
  processing: "قيد التحليل",
  completed: "مكتمل",
  failed: "فشل",
};

const statusColor: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  processing: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

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
            <CardDescription>
              ارفع أي ملف PDF لدفتر شروط لبدء أول تحليل
            </CardDescription>
          </Card>
        )}
        {rows.map((row) => (
          <Link key={row.id} href={`/analyses/${row.id}`}>
            <Card className="transition hover:border-teal-300">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{row.fileName}</CardTitle>
                  <CardDescription>{formatDate(row.createdAt)}</CardDescription>
                </div>
                <Badge className={statusColor[row.status]}>
                  {statusLabel[row.status]}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">التقدم: {row.progress}%</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
