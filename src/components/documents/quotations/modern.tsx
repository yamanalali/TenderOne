import {
  CompanyLogo,
  LineItemsTable,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { QuotationDocumentContent } from "@/lib/documents/types";

export function QuotationModern({
  content,
  accent,
  secondary,
}: {
  content: QuotationDocumentContent;
  accent: string;
  secondary: string;
}) {
  const { company } = content;

  return (
    <div className="flex min-h-full flex-col">
      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="px-8 py-7">
          <div className="flex items-center gap-3">
            <CompanyLogo company={company} className="rounded-2xl" />
            <div>
              <p className="text-[11px] font-black" style={{ color: accent }}>
                QUOTATION
              </p>
              <h1 className="text-2xl font-black" style={{ color: secondary }}>
                {company.nameAr}
              </h1>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-xs font-bold text-slate-400">مقدم إلى</p>
            <p className="mt-1 text-xl font-black text-slate-900">{content.clientName}</p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {[content.clientAddress, content.clientPhone, content.clientEmail]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>
        </div>
        <div
          className="px-8 py-7 text-white"
          style={{ background: `linear-gradient(160deg, ${accent}, ${secondary})` }}
        >
          <p className="text-xs font-bold text-white/70">رقم العرض</p>
          <p className="mt-1 text-2xl font-black">{content.quoteNumber}</p>
          <div className="mt-8 space-y-3 text-sm">
            <div>
              <p className="text-white/60">تاريخ الإصدار</p>
              <p className="font-bold">{formatDate(content.issueDate)}</p>
            </div>
            <div>
              <p className="text-white/60">صالح حتى</p>
              <p className="font-bold">{formatDate(content.validUntil)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <LineItemsTable
          items={content.items}
          currency={content.currency}
          taxRate={content.taxRate}
          accent={accent}
        />
        {(content.notes || content.terms) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {content.notes && (
              <div className="rounded-2xl bg-slate-50 p-4 text-xs">
                <SectionTitle color={accent}>ملاحظات</SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{content.notes}</p>
              </div>
            )}
            {content.terms && (
              <div className="rounded-2xl bg-slate-50 p-4 text-xs">
                <SectionTitle color={accent}>الشروط</SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{content.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
