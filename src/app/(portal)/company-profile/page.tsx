import Link from "next/link";
import { getCompanyAndProfiles } from "@/app/actions/company-profile";
import { listActiveProducts } from "@/app/actions/payments";
import {
  CompanyDataForm,
  CreateProfileForm,
} from "@/components/company-data-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function CompanyProfilePage() {
  const [{ company, profiles, hasAccess }, products] = await Promise.all([
    getCompanyAndProfiles(),
    listActiveProducts(),
  ]);
  const profileProduct = products.find(
    (product) => product.type === "company_profile",
  );
  const paymentsHref = profileProduct
    ? `/payments?productId=${profileProduct.id}`
    : "/payments";

  if (!company) {
    return (
      <Card>
        <CardTitle>لا توجد شركة مرتبطة</CardTitle>
        <CardDescription>سجّل حساب شركة للبدء</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">ملف تعريف الشركة</h1>
          <p className="mt-2 text-slate-600">
            خدمة مستقلة — أدخل بياناتك مرة واحدة ثم أنشئ تصاميم رسمية وعصرية وفاخرة
          </p>
        </div>
        <Link
          href="/templates?type=company_profile"
          className="text-sm font-bold text-amber-700 hover:underline"
        >
          عرض كل تصاميم البروفايل
        </Link>
      </div>

      <CompanyDataForm company={company} />
      <CreateProfileForm hasAccess={hasAccess} paymentsHref={paymentsHref} />

      <div className="grid gap-4">
        <h2 className="text-xl font-bold">الملفات المنشأة</h2>
        {profiles.length === 0 && (
          <Card>
            <CardTitle>لم يتم إنشاء أي ملف بعد</CardTitle>
            <CardDescription className="mt-2">
              أنشئ ملفاً من النموذج أعلاه، أو استخدم محرر المستندات الكامل من
              مستنداتي لتعديل المحتوى بحرية.
            </CardDescription>
            <Link href="/templates?type=company_profile" className="mt-4 inline-block text-sm font-bold text-amber-700 hover:underline">
              إنشاء بروفايل قابل للتعديل من المعرض
            </Link>
          </Card>
        )}
        {profiles.map((profile) => (
          <Link key={profile.id} href={`/company-profile/${profile.id}`}>
            <Card className="transition hover:border-teal-300">
              <CardTitle>{profile.title || "ملف تعريف"}</CardTitle>
              <CardDescription>
                قالب {profile.templateKey} — لغة {profile.language} —{" "}
                {formatDate(profile.createdAt)}
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
