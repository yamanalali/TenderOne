import {
  CompanyLogo,
  LineItemsTable,
  paymentStatusLabel,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { InvoiceDocumentContent } from "@/lib/documents/types";

export function InvoiceModern({
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
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between gap-4 px-8 py-6">
        <div className="flex items-center gap-3">
          <CompanyLogo company={company} className="rounded-2xl" />
          <div>
            <p className="text-[11px] font-black tracking-widest" style={{ color: accent }}>
              INVOICE
            </p>
            <h1 className="text-2xl font-black" style={{ color: secondary }}>
              {company.nameAr}
            </h1>
          </div>
        </div>
        <div
          className="rounded-2xl px-5 py-3 text-end text-white"
          style={{ background: accent }}
        >
          <p className="text-[10px] text-white/70">رقم الفاتورة</p>
          <p className="text-lg font-black">{content.invoiceNumber}</p>
        </div>
      </div>

      <div className="mx-8 grid gap-3 rounded-3xl bg-slate-50 p-5 text-xs md:grid-cols-4">
        <div>
          <p className="text-slate-400">العميل</p>
          <p className="mt-1 font-black text-slate-900">{content.clientName}</p>
        </div>
        <div>
          <p className="text-slate-400">الإصدار</p>
          <p className="mt-1 font-bold">{formatDate(content.issueDate)}</p>
        </div>
        <div>
          <p className="text-slate-400">الاستحقاق</p>
          <p className="mt-1 font-bold">{formatDate(content.dueDate)}</p>
        </div>
        <div>
          <p className="text-slate-400">الحالة</p>
          <p className="mt-1 font-black" style={{ color: accent }}>
            {paymentStatusLabel(content.paymentStatus)}
          </p>
        </div>
      </div>

      <div className="px-8 py-6">
        <LineItemsTable
          items={content.items}
          currency={content.currency}
          taxRate={content.taxRate}
          accent={accent}
        />
        {(content.bankNotes || content.notes) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {content.bankNotes && (
              <div className="rounded-2xl border border-slate-100 p-4 text-xs shadow-sm">
                <SectionTitle color={accent}>الدفع البنكي</SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{content.bankNotes}</p>
              </div>
            )}
            {content.notes && (
              <div className="rounded-2xl border border-slate-100 p-4 text-xs shadow-sm">
                <SectionTitle color={accent}>ملاحظات</SectionTitle>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{content.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
