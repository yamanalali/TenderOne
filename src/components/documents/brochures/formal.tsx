import { CompanyLogo, ContactBlock, SectionTitle } from "@/components/documents/shared";
import type { BrochureDocumentContent } from "@/lib/documents/types";

export function BrochureFormal({
  content,
  accent,
  secondary,
}: {
  content: BrochureDocumentContent;
  accent: string;
  secondary: string;
}) {
  const { company } = content;

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-[11px] font-black tracking-widest" style={{ color: accent }}>
            SERVICES BROCHURE
          </p>
          <h1 className="mt-2 text-2xl font-black" style={{ color: secondary }}>
            {company.nameAr}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{content.tagline}</p>
        </div>
        <CompanyLogo company={company} />
      </header>

      <section className="mt-6">
        <SectionTitle color={accent}>مقدمة</SectionTitle>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {content.intro}
        </p>
      </section>

      <section className="mt-6">
        <SectionTitle color={accent}>خدماتنا</SectionTitle>
        <div className="mt-3 space-y-3">
          {content.services.map((service, index) => (
            <div
              key={service.id}
              className="flex gap-3 rounded-xl border border-slate-200 p-4"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
                style={{ background: accent }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{service.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <SectionTitle color={accent}>لماذا نحن</SectionTitle>
          <ul className="mt-3 space-y-2 text-xs text-slate-700">
            {content.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span style={{ color: accent }}>•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <SectionTitle color={accent}>نطاق العمل</SectionTitle>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-600">
            {content.scope}
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-200 pt-5">
        <p className="text-sm font-black" style={{ color: accent }}>
          {content.cta}
        </p>
        <div className="mt-2">
          <ContactBlock company={company} />
        </div>
      </footer>
    </div>
  );
}
