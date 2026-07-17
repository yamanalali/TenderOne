import { CompanyLogo, ContactBlock, SectionTitle } from "@/components/documents/shared";
import type { BrochureDocumentContent } from "@/lib/documents/types";

export function BrochureModern({
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
    <div className="flex min-h-full flex-col">
      <div
        className="px-8 py-10 text-white"
        style={{ background: `radial-gradient(circle at top left, ${accent}, ${secondary})` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.25em] text-white/70">
              SERVICE OFFERING
            </p>
            <h1 className="mt-3 text-3xl font-black">{company.nameAr}</h1>
            <p className="mt-3 max-w-md text-sm text-white/80">{content.tagline}</p>
          </div>
          <CompanyLogo company={company} className="rounded-2xl ring-2 ring-white/20" />
        </div>
      </div>

      <div className="space-y-5 px-8 py-6">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{content.intro}</p>

        <div className="grid gap-3 md:grid-cols-3">
          {content.services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-100 p-4 shadow-sm"
            >
              <div
                className="mb-3 h-1.5 w-10 rounded-full"
                style={{ background: accent }}
              />
              <p className="text-sm font-black text-slate-900">{service.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <SectionTitle color={accent}>المميزات</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: accent }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <SectionTitle color={accent}>نطاق العمل</SectionTitle>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
              {content.scope}
            </p>
          </div>
        </div>
      </div>

      <footer
        className="mt-auto px-8 py-5 text-white"
        style={{ background: secondary }}
      >
        <p className="text-sm font-black" style={{ color: accent }}>
          {content.cta}
        </p>
        <div className="mt-2 text-white/70">
          <ContactBlock company={company} />
        </div>
      </footer>
    </div>
  );
}
