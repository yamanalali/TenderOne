import type { CompanySnapshot, DocumentLanguage, LineItem } from "@/lib/documents/types";
import {
  calcGrandTotal,
  calcSubtotal,
  calcTax,
  formatMoney,
} from "@/lib/documents/types";
import { cn } from "@/lib/utils";

export function CompanyLogo({
  company,
  className,
}: {
  company: CompanySnapshot;
  className?: string;
}) {
  if (company.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={company.logoUrl}
        alt={company.nameAr}
        className={cn(
          "h-14 w-14 rounded-xl bg-white object-contain p-1",
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-amber-300",
        className,
      )}
    >
      {(company.nameAr || "ش").slice(0, 1)}
    </div>
  );
}

export function SectionTitle({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <h3
      className={cn("text-sm font-black tracking-wide", className)}
      style={{ color }}
    >
      {children}
    </h3>
  );
}

export function MetaGrid({
  items,
}: {
  items: { label: string; value?: string | null }[];
}) {
  return (
    <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="font-bold text-slate-500">{item.label}</p>
          <p className="mt-0.5 font-semibold text-slate-800">{item.value || "—"}</p>
        </div>
      ))}
    </div>
  );
}

export function LineItemsTable({
  items,
  currency,
  taxRate,
  accent,
  dense,
}: {
  items: LineItem[];
  currency: string;
  taxRate: number;
  accent: string;
  dense?: boolean;
}) {
  const subtotal = calcSubtotal(items);
  const tax = calcTax(subtotal, taxRate);
  const total = calcGrandTotal(items, taxRate);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-xs">
        <thead style={{ background: accent, color: "#fff" }}>
          <tr>
            <th className="px-3 py-2 text-start font-bold">البند</th>
            <th className="px-3 py-2 text-center font-bold">الكمية</th>
            <th className="px-3 py-2 text-center font-bold">السعر</th>
            <th className="px-3 py-2 text-end font-bold">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className={cn("px-3 font-semibold text-slate-800", dense ? "py-1.5" : "py-2.5")}>
                {item.description}
                {item.unit ? (
                  <span className="ms-1 text-[10px] font-normal text-slate-400">
                    ({item.unit})
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-center">{item.quantity}</td>
              <td className="px-3 py-2 text-center">
                <bdi>{formatMoney(item.unitPrice, currency)}</bdi>
              </td>
              <td className="px-3 py-2 text-end font-bold">
                <bdi>{formatMoney(item.quantity * item.unitPrice, currency)}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 border-t border-slate-200 bg-slate-50 px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">المجموع الفرعي</span>
          <bdi className="font-bold">{formatMoney(subtotal, currency)}</bdi>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">
            الضريبة (<bdi>{taxRate}%</bdi>)
          </span>
          <bdi className="font-bold">{formatMoney(tax, currency)}</bdi>
        </div>
        <div
          className="flex justify-between rounded-lg px-2 py-2 text-sm font-black text-white"
          style={{ background: accent }}
        >
          <span>الإجمالي</span>
          <bdi>{formatMoney(total, currency)}</bdi>
        </div>
      </div>
    </div>
  );
}

export function ContactBlock({ company }: { company: CompanySnapshot }) {
  return (
    <div className="space-y-1 text-xs text-slate-600">
      {company.phone && (
        <p>
          هاتف: <bdi dir="ltr">{company.phone}</bdi>
        </p>
      )}
      {company.email && (
        <p>
          بريد: <bdi dir="ltr">{company.email}</bdi>
        </p>
      )}
      {company.website && (
        <p>
          موقع: <bdi dir="ltr">{company.website}</bdi>
        </p>
      )}
      {(company.address || company.city) && (
        <p>
          العنوان: {[company.address, company.city, company.country].filter(Boolean).join(" — ")}
        </p>
      )}
    </div>
  );
}

export function langFlags(language: DocumentLanguage) {
  return {
    showAr: language === "ar" || language === "bilingual",
    showEn: language === "en" || language === "bilingual",
  };
}

export function paymentStatusLabel(status: "unpaid" | "partial" | "paid") {
  if (status === "paid") return "مدفوعة";
  if (status === "partial") return "مدفوعة جزئياً";
  return "غير مدفوعة";
}
