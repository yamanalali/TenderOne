import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { getPaymentPageData } from "@/app/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  getProductDestination,
  paymentsHrefForType,
} from "@/lib/product-destination";
import { formatDate } from "@/lib/utils";

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد المراجعة", className: "bg-amber-100 text-amber-800" },
  approved: { label: "مقبول", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "مرفوض", className: "bg-rose-100 text-rose-800" },
};

export default async function MyServicesPage() {
  const { orders, entitlements, products } = await getPaymentPageData();

  function findEntitlement(orderId: string, productId: string) {
    return (
      entitlements.find(
        (entitlement) => entitlement.sourcePaymentId === orderId,
      ) ||
      entitlements.find(
        (entitlement) =>
          entitlement.productId === productId && entitlement.isActive,
      )
    );
  }

  const credits = entitlements
    .filter((e) => e.type === "analysis_credit" && e.isActive)
    .reduce((sum, e) => sum + e.remainingCredits, 0);

  const pendingCount = orders.filter(
    ({ order }) => order.status === "pending",
  ).length;

  const approvedOrders = orders.filter(({ order, product }) => {
    if (order.status !== "approved") return false;
    const entitlement = findEntitlement(order.id, product.id);
    return (
      Boolean(entitlement?.isActive) &&
      (entitlement?.type !== "analysis_credit" ||
        (entitlement?.remainingCredits || 0) > 0)
    );
  });

  const buyCreditsHref = paymentsHrefForType(products, "analysis_credit");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">خدماتي ورصيدي</h1>
          <p className="mt-2 text-slate-600">
            رصيدك، خدماتك المفعّلة، وطلبات الشراء — كل شيء في مكان واحد
          </p>
        </div>
        <Link href="/payments">
          <Button variant="outline" className="gap-2">
            شراء خدمة جديدة
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">رصيد التحليل</p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {credits}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 ring-1 ring-amber-200">
              <Zap className="h-5 w-5 text-amber-700" />
            </div>
          </div>
          <Link
            href={credits > 0 ? "/analyses/new" : buyCreditsHref}
            className="mt-4 inline-block"
          >
            <Button size="sm" variant={credits > 0 ? "default" : "outline"} className="gap-2">
              {credits > 0 ? "ابدأ تحليل ملف" : "شراء رصيد تحليل"}
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">
                خدمات مفعّلة
              </p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {approvedOrders.length}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            جاهزة للاستخدام مباشرة أدناه
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">
                طلبات قيد المراجعة
              </p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {pendingCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
              <Clock3 className="h-5 w-5 text-amber-700" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            تُفعَّل تلقائياً بعد موافقة الإدارة
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-black text-emerald-700">جاهزة للاستخدام</p>
          <h2 className="mt-1 text-2xl font-black text-[#071426]">
            خدماتي المفعّلة
          </h2>
        </div>

        {approvedOrders.length === 0 && (
          <Card>
            <CardTitle>لا توجد خدمات مفعّلة بعد</CardTitle>
            <CardDescription className="mt-2">
              اشترِ خدمة من صفحة شراء الخدمات، وبعد موافقة الإدارة ستظهر هنا
              جاهزة للاستخدام.
            </CardDescription>
            <Link href="/payments" className="mt-4 inline-block">
              <Button size="sm" className="gap-2">
                الخدمات المتاحة للشراء
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {approvedOrders.map(({ order, product }) => {
            const destination = getProductDestination(product);
            return (
              <Card
                key={order.id}
                className="border-emerald-200 bg-emerald-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{product.nameAr}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {destination.description}
                    </CardDescription>
                  </div>
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                </div>
                <Link href={destination.href} className="mt-5 inline-block">
                  <Button className="gap-2">
                    {destination.label}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold">طلباتي</h2>
        {orders.length === 0 && (
          <Card>
            <CardTitle>لا توجد طلبات بعد</CardTitle>
            <CardDescription className="mt-2">
              اختر خدمة من صفحة شراء الخدمات وارفع إشعار التحويل لبدء التفعيل.
            </CardDescription>
          </Card>
        )}
        {orders.map(({ order, product }) => {
          const meta = statusMeta[order.status];
          const destination = getProductDestination(product);
          const entitlement = findEntitlement(order.id, product.id);
          const isAvailable =
            Boolean(entitlement?.isActive) &&
            (entitlement?.type !== "analysis_credit" ||
              (entitlement?.remainingCredits || 0) > 0);
          return (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{product.nameAr}</CardTitle>
                  <CardDescription>
                    {formatDate(order.createdAt)}
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
              {order.status === "pending" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    طلبك وصل للإدارة. بعد الموافقة سيظهر زر استخدام الخدمة
                    مباشرة في قسم «خدماتي المفعّلة» أعلى الصفحة.
                  </p>
                </div>
              )}
              {order.status === "approved" && isAvailable && (
                <Link href={destination.href} className="mt-4 inline-block">
                  <Button size="sm" className="gap-2">
                    {destination.label}
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
              {order.status === "approved" &&
                product.type === "analysis_credit" &&
                !isAvailable && (
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    تم استخدام كامل رصيد التحليل الخاص بهذا الطلب.
                  </p>
                )}
              {order.status === "rejected" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    صحّح سبب الرفض الموضح أعلاه ثم قدّم طلب تفعيل جديد من صفحة
                    شراء الخدمات.
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </section>
    </div>
  );
}
