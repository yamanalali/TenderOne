import { listPendingPayments } from "@/app/actions/payments";
import { PaymentReviewButtons } from "@/components/admin-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const rows = await listPendingPayments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">مراجعة المدفوعات</h1>
        <p className="mt-2 text-slate-600">
          وافق لتفعيل الخدمة أو ارفض الطلب — مع منع الموافقة المكررة
        </p>
      </div>

      <div className="grid gap-4">
        {rows.length === 0 && (
          <Card>
            <CardDescription>لا توجد طلبات</CardDescription>
          </Card>
        )}
        {rows.map(({ order, product }) => (
          <Card key={order.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{product.nameAr}</CardTitle>
                <CardDescription>
                  {order.amount} {order.currency} — {formatDate(order.createdAt)}
                </CardDescription>
              </div>
              <Badge
                className={
                  order.status === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : order.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                }
              >
                {order.status}
              </Badge>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>مرجع التحويل: {order.transferReference}</p>
              <p>ملاحظة: {order.transferNote || "—"}</p>
              {order.receiptUrl && (
                <a
                  href={order.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 underline"
                >
                  عرض إشعار التحويل
                </a>
              )}
            </div>
            {order.status === "pending" && (
              <div className="mt-4">
                <PaymentReviewButtons orderId={order.id} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
