import {
  CompanyLogo,
  LineItemsTable,
  paymentStatusLabel,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { InvoiceDocumentContent } from "@/lib/documents/types";

export function InvoiceFormal({
  content,
  accent,
  secondary,
}: {
  content: InvoiceDocumentContent;
  accent: string;
  secondary: string;
}) {
  const { company } = content;

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="flex items-start justify-between border-b-2 pb-5" style={{ borderColor: accent }}>
        <div className="flex items-center gap-3">
          <CompanyLogo company={company} />
          <div>
            <h1 className="text-xl font-black" style={{ color: secondary }}>
              {company.nameAr}
            </h1>
            <p className="text-xs text-slate-500">
              س.ت {company.commercialRegister || "—"} · ضريبي {company.taxCard || "—"}
            </p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs font-black" style={{ color: accent }}>
            فاتورة
          </p>
          <p className="text-xl font-black">{content.invoiceNumber}</p>
          <span
            className="mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-black text-white"
            style={{ background: accent }}
          >
            {paymentStatusLabel(content.paymentStatus)}
          </span>
        </div>
      </header>

      <div className="mt-5 grid gap-4 text-xs md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <SectionTitle color={accent}>فاتورة إلى</SectionTitle>
          <p className="mt-2 text-sm font-black">{content.clientName}</p>
          <p className="mt-1 text-slate-600">{content.clientAddress}</p>
          <p className="text-slate-600">{content.clientPhone}</p>
          <p className="text-slate-600">{content.clientEmail}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <SectionTitle color={accent}>تفاصيل الفاتورة</SectionTitle>
          <div className="mt-2 space-y-1 text-slate-700">
            <p>تاريخ الإصدار: {formatDate(content.issueDate)}</p>
            <p>تاريخ الاستحقاق: {formatDate(content.dueDate)}</p>
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
          dense
        />
      </div>

      {(content.bankNotes || content.notes) && (
        <div className="mt-6 space-y-3 text-xs text-slate-600">
          {content.bankNotes && (
            <div className="rounded-lg bg-slate-50 p-3">
              <SectionTitle color={accent}>ملاحظات بنكية</SectionTitle>
              <p className="mt-2 whitespace-pre-wrap">{content.bankNotes}</p>
            </div>
          )}
          {content.notes && <p className="whitespace-pre-wrap">{content.notes}</p>}
        </div>
      )}
    </div>
  );
}
