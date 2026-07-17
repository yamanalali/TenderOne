import Link from "next/link";
import { listAdminPayments } from "@/app/actions/payments";
import { PaymentReviewButtons } from "@/components/admin-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  paymentStatusColor,
  paymentStatusLabel,
} from "@/lib/status-labels";
import { cn, formatDate } from "@/lib/utils";

const tabs = [
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "مقبول" },
  { key: "rejected", label: "مرفوض" },
  { key: "all", label: "الكل" },
] as const;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "pending";
  const rows = await listAdminPayments(status === "all" ? "all" : status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">مراجعة المدفوعات</h1>
        <p className="mt-2 text-slate-600">
          وافق لتفعيل الخدمة أو ارفض الطلب مع ذكر السبب — مع منع الموافقة المكررة
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={
              tab.key === "pending"
                ? "/admin/payments"
                : `/admin/payments?status=${tab.key}`
            }
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              status === tab.key
                ? "bg-[#071426] text-amber-300"
                : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300/50",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4">
        {rows.length === 0 && (
          <Card>
            <CardDescription>لا توجد طلبات في هذا التبويب</CardDescription>
          </Card>
        )}
        {rows.map(({ order, product, companyName, userName, userEmail }) => (
          <Card key={order.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{product.nameAr}</CardTitle>
                <CardDescription>
                  {order.amount} {order.currency} — {formatDate(order.createdAt)}
                </CardDescription>
              </div>
              <Badge className={paymentStatusColor[order.status]}>
                {paymentStatusLabel[order.status] || order.status}
              </Badge>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                الشركة: <span className="font-bold text-slate-900">{companyName}</span>
              </p>
              <p>
                مقدم الطلب: {userName} ({userEmail})
              </p>
              <p>مرجع التحويل: {order.transferReference}</p>
              <p>ملاحظة: {order.transferNote || "—"}</p>
              {order.reviewNote && <p>ملاحظة المراجعة: {order.reviewNote}</p>}
            </div>
            {order.status === "pending" && (
              <div className="mt-4">
                <PaymentReviewButtons
                  orderId={order.id}
                  receiptUrl={order.receiptUrl}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
