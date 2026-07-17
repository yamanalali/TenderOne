import {
  CompanyLogo,
  ContactBlock,
  langFlags,
  MetaGrid,
  SectionTitle,
} from "@/components/documents/shared";
import type { DocumentLanguage, ProfileDocumentContent } from "@/lib/documents/types";

export function ProfileFormal({
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
      <header
        className="flex items-start justify-between gap-4 border-b-4 px-8 py-7"
        style={{ borderColor: accent }}
      >
        <div>
          <p className="text-[11px] font-black tracking-[0.2em]" style={{ color: accent }}>
            COMPANY PROFILE
          </p>
          {showAr && (
            <h1 className="mt-2 text-3xl font-black" style={{ color: secondary }}>
              {company.nameAr}
            </h1>
          )}
          {showEn && (
            <h2 className="mt-1 text-xl font-bold text-slate-600" dir="ltr">
              {company.nameEn || company.nameAr}
            </h2>
          )}
          {content.tagline && (
            <p className="mt-3 max-w-xl text-sm text-slate-500">{content.tagline}</p>
          )}
        </div>
        <CompanyLogo company={company} />
      </header>

      <div className="flex-1 space-y-6 px-8 py-6">
        <MetaGrid
          items={[
            { label: "السجل التجاري", value: company.commercialRegister },
            { label: "البطاقة الضريبية", value: company.taxCard },
            { label: "المدينة", value: company.city },
            { label: "الدولة", value: company.country },
          ]}
        />

        {content.showAbout && (showAr ? company.aboutAr : company.aboutEn) && (
          <section>
            <SectionTitle color={accent}>
              {showAr ? "نبذة عن الشركة" : "About"}
            </SectionTitle>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {showAr ? company.aboutAr : company.aboutEn}
            </p>
          </section>
        )}

        {content.showServices && (showAr ? company.servicesAr : company.servicesEn) && (
          <section className="rounded-xl border border-slate-200 p-4">
            <SectionTitle color={accent}>
              {showAr ? "الخدمات" : "Services"}
            </SectionTitle>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {showAr ? company.servicesAr : company.servicesEn}
            </p>
          </section>
        )}

        {content.showExperience &&
          (showAr ? company.experienceAr : company.experienceEn) && (
            <section>
              <SectionTitle color={accent}>
                {showAr ? "الخبرات" : "Experience"}
              </SectionTitle>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {showAr ? company.experienceAr : company.experienceEn}
              </p>
            </section>
          )}
      </div>

      {content.showContact && (
        <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-8 py-5">
          <SectionTitle color={accent}>بيانات التواصل</SectionTitle>
          <div className="mt-2">
            <ContactBlock company={company} />
          </div>
        </footer>
      )}
    </div>
  );
}
