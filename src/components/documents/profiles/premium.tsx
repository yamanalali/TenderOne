import {
  CompanyLogo,
  ContactBlock,
  langFlags,
  SectionTitle,
} from "@/components/documents/shared";
import type { DocumentLanguage, ProfileDocumentContent } from "@/lib/documents/types";

export function ProfilePremium({
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
    <div className="flex min-h-full flex-col" style={{ background: "#fbf8f1" }}>
      <div
        className="relative px-8 py-12 text-center text-white"
        style={{ background: secondary }}
      >
        <div
          className="mx-auto mb-4 h-px w-24"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        <CompanyLogo
          company={company}
          className="mx-auto mb-4 h-16 w-16 rounded-2xl ring-2"
          // className ring color via style wrapper
        />
        <p className="text-[11px] font-black tracking-[0.35em]" style={{ color: accent }}>
          PREMIUM PROFILE
        </p>
        {showAr && <h1 className="mt-3 text-3xl font-black">{company.nameAr}</h1>}
        {showEn && (
          <h2 className="mt-2 text-lg text-white/75" dir="ltr">
            {company.nameEn || company.nameAr}
          </h2>
        )}
        {content.tagline && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/70">{content.tagline}</p>
        )}
        <div
          className="mx-auto mt-6 h-px w-24"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      </div>

      <div className="space-y-5 px-8 py-7">
        <div
          className="grid gap-3 rounded-2xl border p-4 text-xs sm:grid-cols-3"
          style={{ borderColor: `${accent}55` }}
        >
          <div>
            <p className="font-bold" style={{ color: accent }}>
              السجل التجاري
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {company.commercialRegister || "—"}
            </p>
          </div>
          <div>
            <p className="font-bold" style={{ color: accent }}>
              البطاقة الضريبية
            </p>
            <p className="mt-1 font-semibold text-slate-800">{company.taxCard || "—"}</p>
          </div>
          <div>
            <p className="font-bold" style={{ color: accent }}>
              المقر
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {[company.city, company.country].filter(Boolean).join(" — ") || "—"}
            </p>
          </div>
        </div>

        {content.showAbout && (showAr ? company.aboutAr : company.aboutEn) && (
          <section>
            <SectionTitle color={accent} className="text-center">
              {showAr ? "نبذة مؤسسية" : "Corporate Overview"}
            </SectionTitle>
            <p className="mt-3 whitespace-pre-wrap text-center text-sm leading-8 text-slate-700">
              {showAr ? company.aboutAr : company.aboutEn}
            </p>
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {content.showServices && (showAr ? company.servicesAr : company.servicesEn) && (
            <section
              className="rounded-2xl p-5 text-white"
              style={{ background: secondary }}
            >
              <SectionTitle color={accent}>
                {showAr ? "الخدمات" : "Services"}
              </SectionTitle>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/80">
                {showAr ? company.servicesAr : company.servicesEn}
              </p>
            </section>
          )}
          {content.showExperience &&
            (showAr ? company.experienceAr : company.experienceEn) && (
              <section
                className="rounded-2xl border bg-white p-5"
                style={{ borderColor: `${accent}66` }}
              >
                <SectionTitle color={accent}>
                  {showAr ? "الخبرات" : "Experience"}
                </SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {showAr ? company.experienceAr : company.experienceEn}
                </p>
              </section>
            )}
        </div>
      </div>

      {content.showContact && (
        <footer
          className="mt-auto px-8 py-5 text-center text-white"
          style={{ background: secondary }}
        >
          <SectionTitle color={accent}>تواصل معنا</SectionTitle>
          <div className="mt-2 flex justify-center text-white/80">
            <ContactBlock company={company} />
          </div>
        </footer>
      )}
    </div>
  );
}
