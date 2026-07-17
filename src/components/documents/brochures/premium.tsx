import { CompanyLogo, ContactBlock, SectionTitle } from "@/components/documents/shared";
import type { BrochureDocumentContent } from "@/lib/documents/types";

export function BrochurePremium({
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
    <div className="flex min-h-full flex-col" style={{ background: "#fbf8f1" }}>
      <div className="px-8 py-12 text-center text-white" style={{ background: secondary }}>
        <CompanyLogo company={company} className="mx-auto rounded-2xl ring-1 ring-amber-300/40" />
        <p className="mt-4 text-[11px] font-black tracking-[0.35em]" style={{ color: accent }}>
          PREMIUM SERVICES
        </p>
        <h1 className="mt-3 text-3xl font-black">{company.nameAr}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">{content.tagline}</p>
      </div>

      <div className="space-y-6 px-8 py-7">
        <p className="whitespace-pre-wrap text-center text-sm leading-8 text-slate-700">
          {content.intro}
        </p>

        <div className="space-y-3">
          {content.services.map((service, index) => (
            <div
              key={service.id}
              className="grid items-center gap-4 rounded-2xl border bg-white p-4 md:grid-cols-[auto_1fr]"
              style={{ borderColor: `${accent}55` }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black"
                style={{ background: secondary, color: accent }}
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

        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: secondary }}
        >
          <SectionTitle color={accent} className="text-center">
            لماذا تختارنا
          </SectionTitle>
          <div className="mt-4 grid gap-2 text-center text-xs text-white/80 sm:grid-cols-2">
            {content.features.map((feature) => (
              <p key={feature}>{feature}</p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 text-center" style={{ borderColor: `${accent}66` }}>
          <SectionTitle color={accent}>نطاق العمل</SectionTitle>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-7 text-slate-600">
            {content.scope}
          </p>
        </div>
      </div>

      <footer className="mt-auto px-8 py-6 text-center" style={{ background: secondary }}>
        <p className="text-sm font-black" style={{ color: accent }}>
          {content.cta}
        </p>
        <div className="mt-3 flex justify-center text-white/70">
          <ContactBlock company={company} />
        </div>
      </footer>
    </div>
  );
}
