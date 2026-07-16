import { getPaymentPageData } from "@/app/actions/payments";
import { PaymentForm } from "@/components/payment-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد المراجعة", className: "bg-amber-100 text-amber-800" },
  approved: { label: "مقبول", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "مرفوض", className: "bg-rose-100 text-rose-800" },
};

export default async function PaymentsPage() {
  const { products, orders, settings } = await getPaymentPageData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">نظام الدفع</h1>
        <p className="mt-2 text-slate-600">
          اختر الخدمة، ارفع إشعار التحويل، وفعّلها بعد موافقة المدير
        </p>
      </div>

      <PaymentForm
        products={products}
        bankName={settings.bankName}
        bankAccountName={settings.bankAccountName}
        bankIban={settings.bankIban}
      />

      <div className="grid gap-4">
        <h2 className="text-xl font-bold">طلباتي</h2>
        {orders.length === 0 && (
          <Card>
            <CardDescription>لا توجد طلبات بعد</CardDescription>
          </Card>
        )}
        {orders.map(({ order, product }) => {
          const meta = statusMeta[order.status];
          return (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{product.nameAr}</CardTitle>
                  <CardDescription>
                    {order.amount} {order.currency} — {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <Badge className={meta.className}>{meta.label}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                مرجع التحويل: {order.transferReference}
              </p>
              {order.reviewNote && (
                <p className="mt-2 text-sm text-slate-600">
                  ملاحظة المراجعة: {order.reviewNote}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
