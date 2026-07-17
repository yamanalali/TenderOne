import {
  CompanyLogo,
  LineItemsTable,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { QuotationDocumentContent } from "@/lib/documents/types";

export function QuotationFormal({
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
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <CompanyLogo company={company} />
          <div>
            <h1 className="text-xl font-black" style={{ color: secondary }}>
              {company.nameAr}
            </h1>
            <p className="text-xs text-slate-500">{company.email || company.phone}</p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs font-black tracking-widest" style={{ color: accent }}>
            عرض سعر
          </p>
          <p className="mt-1 text-lg font-black text-slate-900">{content.quoteNumber}</p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 text-xs md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <SectionTitle color={accent}>إلى السيد / الجهة</SectionTitle>
          <p className="mt-2 text-sm font-bold text-slate-900">{content.clientName}</p>
          <p className="mt-1 text-slate-600">{content.clientAddress || "—"}</p>
          <p className="text-slate-600">{content.clientPhone}</p>
          <p className="text-slate-600">{content.clientEmail}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <SectionTitle color={accent}>بيانات العرض</SectionTitle>
          <div className="mt-2 space-y-1 text-slate-700">
            <p>تاريخ الإصدار: {formatDate(content.issueDate)}</p>
            <p>صالح حتى: {formatDate(content.validUntil)}</p>
            <p>العملة: {content.currency}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <LineItemsTable
          items={content.items}
          currency={content.currency}
          taxRate={content.taxRate}
          accent={accent}
        />
      </div>

      {(content.notes || content.terms) && (
        <div className="mt-6 grid gap-4 text-xs md:grid-cols-2">
          {content.notes && (
            <div>
              <SectionTitle color={accent}>ملاحظات</SectionTitle>
              <p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">
                {content.notes}
              </p>
            </div>
          )}
          {content.terms && (
            <div>
              <SectionTitle color={accent}>الشروط</SectionTitle>
              <p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">
                {content.terms}
              </p>
            </div>
          )}
        </div>
      )}

      <footer className="mt-auto flex justify-between border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>مع خالص التحية والتقدير</p>
        <p>توقيع واعتماد الشركة</p>
      </footer>
    </div>
  );
}
