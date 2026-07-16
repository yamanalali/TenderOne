import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/app/actions/company-profile";
import { PrintButton } from "@/components/print-button";
import { Card } from "@/components/ui/card";
import { getProfileTemplate } from "@/lib/company-profile-templates";

export default async function CompanyProfileViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCompanyProfile(id);
  if (!data?.company || !data.profile) notFound();

  const { company, profile } = data;
  const template = getProfileTemplate(profile.templateKey);
  const lang = profile.language;
  const showAr = lang === "ar" || lang === "bilingual";
  const showEn = lang === "en" || lang === "bilingual";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PrintButton />
      </div>

      <Card
        className="overflow-hidden p-0"
        style={{ borderTop: `8px solid ${template.accent}` }}
      >
        <div className="p-8">
          <p className="text-sm font-bold" style={{ color: template.accent }}>
            Company Profile — {template.nameAr}
          </p>
          {showAr && (
            <h1 className="mt-3 text-3xl font-black text-slate-900">
              {company.nameAr}
            </h1>
          )}
          {showEn && (
            <h2 className="mt-2 text-2xl font-bold text-slate-700">
              {company.nameEn || company.nameAr}
            </h2>
          )}

          <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p>السجل التجاري: {company.commercialRegister || "—"}</p>
            <p>البطاقة الضريبية: {company.taxCard || "—"}</p>
            <p>المدينة: {company.city || "—"}</p>
            <p>الهاتف: {company.phone || "—"}</p>
            <p>البريد: {company.email || "—"}</p>
            <p>الموقع: {company.website || "—"}</p>
          </div>

          {showAr && company.aboutAr && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                نبذة عن الشركة
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700">
                {company.aboutAr}
              </p>
            </section>
          )}
          {showEn && company.aboutEn && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                About the Company
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700" dir="ltr">
                {company.aboutEn}
              </p>
            </section>
          )}
          {showAr && company.servicesAr && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                الخدمات
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700">
                {company.servicesAr}
              </p>
            </section>
          )}
          {showEn && company.servicesEn && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                Services
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700" dir="ltr">
                {company.servicesEn}
              </p>
            </section>
          )}
          {showAr && company.experienceAr && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                الخبرات
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700">
                {company.experienceAr}
              </p>
            </section>
          )}
          {showEn && company.experienceEn && (
            <section className="mt-8">
              <h3 className="text-lg font-bold" style={{ color: template.accent }}>
                Experience
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700" dir="ltr">
                {company.experienceEn}
              </p>
            </section>
          )}
        </div>
      </Card>
    </div>
  );
}
