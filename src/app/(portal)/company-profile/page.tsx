import Link from "next/link";
import { getCompanyAndProfiles } from "@/app/actions/company-profile";
import {
  CompanyDataForm,
  CreateProfileForm,
} from "@/components/company-data-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function CompanyProfilePage() {
  const { company, profiles, hasAccess } = await getCompanyAndProfiles();

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
      <div>
        <h1 className="text-3xl font-black">ملف تعريف الشركة</h1>
        <p className="mt-2 text-slate-600">
          خدمة مستقلة — أدخل بياناتك مرة واحدة ثم أنشئ تصاميم متعددة
        </p>
      </div>

      <CompanyDataForm company={company} />
      <CreateProfileForm hasAccess={hasAccess} />

      <div className="grid gap-4">
        <h2 className="text-xl font-bold">الملفات المنشأة</h2>
        {profiles.length === 0 && (
          <Card>
            <CardDescription>لم يتم إنشاء أي ملف بعد</CardDescription>
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
