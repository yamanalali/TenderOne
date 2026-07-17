import {
  CompanyLogo,
  LineItemsTable,
  paymentStatusLabel,
  SectionTitle,
} from "@/components/documents/shared";
import { formatDate } from "@/lib/utils";
import type { InvoiceDocumentContent } from "@/lib/documents/types";

export function InvoicePremium({
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
    <div className="flex min-h-full flex-col" style={{ background: "#faf7f0" }}>
      <div className="relative overflow-hidden px-8 py-8 text-white" style={{ background: secondary }}>
        <div
          className="absolute -start-8 -top-8 h-40 w-40 rounded-full opacity-20"
          style={{ background: accent }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.3em]" style={{ color: accent }}>
              PREMIUM INVOICE
            </p>
            <h1 className="mt-2 text-2xl font-black">{company.nameAr}</h1>
            <p className="mt-2 text-xs text-white/60">
              {company.email} · {company.phone}
            </p>
          </div>
          <CompanyLogo company={company} className="rounded-2xl ring-1 ring-amber-300/30" />
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <div className="rounded-xl border px-4 py-2" style={{ borderColor: accent }}>
            <p className="text-[10px]" style={{ color: accent }}>
              رقم الفاتورة
            </p>
            <p className="font-black">{content.invoiceNumber}</p>
          </div>
          <div className="rounded-xl border border-white/15 px-4 py-2">
            <p className="text-[10px] text-white/50">الحالة</p>
            <p className="font-black" style={{ color: accent }}>
              {paymentStatusLabel(content.paymentStatus)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-8 py-6 text-xs md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: `${accent}55` }}>
          <SectionTitle color={accent}>إلى</SectionTitle>
          <p className="mt-2 text-sm font-black">{content.clientName}</p>
          <p className="mt-2 leading-6 text-slate-600">
            {[content.clientAddress, content.clientPhone, content.clientEmail]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionTitle color={accent}>المواعيد</SectionTitle>
          <p className="mt-2">الإصدار: {formatDate(content.issueDate)}</p>
          <p className="mt-1">الاستحقاق: {formatDate(content.dueDate)}</p>
        </div>
      </div>

      <div className="px-8 pb-8">
        <LineItemsTable
          items={content.items}
          currency={content.currency}
          taxRate={content.taxRate}
          accent={accent}
        />
        {content.bankNotes && (
          <div
            className="mt-5 rounded-2xl p-4 text-xs text-white"
            style={{ background: secondary }}
          >
            <SectionTitle color={accent}>تعليمات التحويل</SectionTitle>
            <p className="mt-2 whitespace-pre-wrap text-white/80">{content.bankNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
