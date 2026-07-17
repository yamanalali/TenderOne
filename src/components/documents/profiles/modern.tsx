import {
  CompanyLogo,
  ContactBlock,
  langFlags,
  SectionTitle,
} from "@/components/documents/shared";
import type { DocumentLanguage, ProfileDocumentContent } from "@/lib/documents/types";

export function ProfileModern({
  content,
  language,
  accent,
  secondary,
}: {
  content: ProfileDocumentContent;
  language: DocumentLanguage;
  accent: string;
  secondary: string;
}) {
  const { company } = content;
  const { showAr, showEn } = langFlags(language);

  return (
    <div className="flex min-h-full flex-col">
      <div
        className="relative overflow-hidden px-8 py-10 text-white"
        style={{
          background: `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`,
        }}
      >
        <div className="absolute -start-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.25em] text-white/70">
              MODERN PROFILE
            </p>
            {showAr && <h1 className="mt-3 text-3xl font-black">{company.nameAr}</h1>}
            {showEn && (
              <h2 className="mt-1 text-lg font-semibold text-white/80" dir="ltr">
                {company.nameEn || company.nameAr}
              </h2>
            )}
            {content.tagline && (
              <p className="mt-4 max-w-md text-sm text-white/80">{content.tagline}</p>
            )}
          </div>
          <CompanyLogo company={company} className="ring-2 ring-white/30" />
        </div>
      </div>

      <div className="grid flex-1 gap-4 px-8 py-6 md:grid-cols-5">
        <aside className="space-y-3 rounded-2xl bg-slate-50 p-4 md:col-span-2">
          <SectionTitle color={accent}>بيانات أساسية</SectionTitle>
          <div className="space-y-2 text-xs text-slate-600">
            <p>س.ت: {company.commercialRegister || "—"}</p>
            <p>ضريبي: {company.taxCard || "—"}</p>
            <p>
              الموقع: {[company.city, company.country].filter(Boolean).join("، ") || "—"}
            </p>
          </div>
          {content.showContact && (
            <div className="border-t border-slate-200 pt-3">
              <ContactBlock company={company} />
            </div>
          )}
        </aside>

        <div className="space-y-4 md:col-span-3">
          {content.showAbout && (showAr ? company.aboutAr : company.aboutEn) && (
            <section className="rounded-2xl border border-slate-100 p-4 shadow-sm">
              <SectionTitle color={accent}>
                {showAr ? "من نحن" : "About us"}
              </SectionTitle>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {showAr ? company.aboutAr : company.aboutEn}
              </p>
            </section>
          )}
          {content.showServices && (showAr ? company.servicesAr : company.servicesEn) && (
            <section className="rounded-2xl border border-slate-100 p-4 shadow-sm">
              <SectionTitle color={accent}>
                {showAr ? "خدماتنا" : "Services"}
              </SectionTitle>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {showAr ? company.servicesAr : company.servicesEn}
              </p>
            </section>
          )}
          {content.showExperience &&
            (showAr ? company.experienceAr : company.experienceEn) && (
              <section className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <SectionTitle color={accent}>
                  {showAr ? "خبراتنا" : "Experience"}
                </SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {showAr ? company.experienceAr : company.experienceEn}
                </p>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}
