import {
  CompanyLogo,
  LineItemsTable,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { QuotationDocumentContent } from "@/lib/documents/types";

export function QuotationPremium({
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
    <div className="flex min-h-full flex-col" style={{ background: "#faf7f0" }}>
      <div className="px-8 py-6 text-white" style={{ background: secondary }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo company={company} className="rounded-xl ring-1 ring-amber-300/40" />
            <div>
              <p className="text-[10px] font-black tracking-[0.3em]" style={{ color: accent }}>
                PREMIUM QUOTE
              </p>
              <h1 className="text-xl font-black">{company.nameAr}</h1>
            </div>
          </div>
          <div className="rounded-xl border px-4 py-3 text-end" style={{ borderColor: accent }}>
            <p className="text-[10px]" style={{ color: accent }}>
              رقم العرض
            </p>
            <p className="text-lg font-black">{content.quoteNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-8 py-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 md:col-span-2" style={{ borderColor: `${accent}55` }}>
          <SectionTitle color={accent}>العميل</SectionTitle>
          <p className="mt-2 text-lg font-black text-slate-900">{content.clientName}</p>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            {[content.clientAddress, content.clientPhone, content.clientEmail]
              .filter(Boolean)
              .join("\n") || "—"}
          </p>
        </div>
        <div className="rounded-2xl p-4 text-white" style={{ background: secondary }}>
          <p className="text-xs" style={{ color: accent }}>
            التواريخ
          </p>
          <p className="mt-3 text-sm">الإصدار: {formatDate(content.issueDate)}</p>
          <p className="mt-1 text-sm">الصلاحية: {formatDate(content.validUntil)}</p>
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
          <div className="mt-5 space-y-3 text-xs">
            {content.notes && (
              <p className="whitespace-pre-wrap text-slate-600">
                <span className="font-black" style={{ color: accent }}>
                  ملاحظات:{" "}
                </span>
                {content.notes}
              </p>
            )}
            {content.terms && (
              <p className="whitespace-pre-wrap text-slate-600">
                <span className="font-black" style={{ color: accent }}>
                  الشروط:{" "}
                </span>
                {content.terms}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
