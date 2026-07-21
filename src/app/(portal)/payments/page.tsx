import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getPaymentPageData } from "@/app/actions/payments";
import { PaymentForm } from "@/components/payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const params = await searchParams;
  const { products, settings, entitlements } = await getPaymentPageData();

  const activeEntitlements = entitlements.filter((e) => e.isActive);
  const ownedProductIds = new Set(
    activeEntitlements.map((e) => e.productId).filter(Boolean),
  );
  const hasDocumentsPack = products.some((product) => {
    const metadata = product.metadata as { serviceCode?: string } | null;
    return (
      metadata?.serviceCode === "documents_pack" &&
      ownedProductIds.has(product.id)
    );
  });
  const hasProfileAccess =
    hasDocumentsPack ||
    activeEntitlements.some((e) => e.type === "company_profile");

  // Analysis credits are consumable, so they stay purchasable. One-time
  // unlocks (templates, packs, profile builder) disappear once active.
  const availableProducts = products.filter((product) => {
    if (product.type === "analysis_credit") return true;
    if (ownedProductIds.has(product.id)) return false;
    if (product.type === "company_profile" && hasProfileAccess) return false;
    return true;
  });
  const ownedCount = products.length - availableProducts.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">شراء الخدمات</h1>
          <p className="mt-2 text-slate-600">
            اختر الخدمة، ارفع إشعار التحويل، وفعّلها بعد موافقة المدير
          </p>
        </div>
        <Link href="/my-services">
          <Button variant="outline" className="gap-2">
            خدماتي ورصيدي
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {ownedCount > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <CardTitle>لديك خدمات مفعّلة بالفعل</CardTitle>
              <CardDescription className="mt-1 leading-6">
                الخدمات التي اشتريتها وفعّلتها لا تظهر هنا — تجدها جاهزة
                للاستخدام في صفحة «خدماتي ورصيدي».
              </CardDescription>
              <Link href="/my-services" className="mt-3 inline-block">
                <Button size="sm" variant="outline" className="gap-2">
                  عرض خدماتي المفعّلة
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {availableProducts.length === 0 ? (
        <Card>
          <CardTitle>كل الخدمات مفعّلة لديك</CardTitle>
          <CardDescription className="mt-2">
            لا توجد خدمات جديدة متاحة للشراء حالياً. يمكنك استخدام خدماتك من
            صفحة «خدماتي ورصيدي».
          </CardDescription>
        </Card>
      ) : (
        <PaymentForm
          products={availableProducts}
          bankName={settings.bankName}
          bankAccountName={settings.bankAccountName}
          bankIban={settings.bankIban}
          contactEmail={settings.contactEmail}
          contactPhone={settings.contactPhone}
          initialProductId={params.productId}
        />
      )}
    </div>
  );
}
