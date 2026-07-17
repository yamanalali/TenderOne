import { getCompanyAndProfiles } from "@/app/actions/company-profile";
import { CompanyDataForm } from "@/components/company-data-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function CompanySettingsPage() {
  const { company } = await getCompanyAndProfiles();

  if (!company) {
    return (
      <Card>
        <CardTitle>لا توجد شركة مرتبطة</CardTitle>
        <CardDescription>اربط حسابك بشركة لتعديل الإعدادات.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black text-amber-600">إعدادات الحساب</p>
        <h1 className="mt-1 text-3xl font-black text-[#071426]">
          إعدادات الشركة والهوية
        </h1>
        <p className="mt-2 text-slate-600">
          حدّث الشعار والبيانات التي تظهر تلقائياً في المستندات والنماذج.
        </p>
      </div>
      <CompanyDataForm company={company} />
    </div>
  );
}
