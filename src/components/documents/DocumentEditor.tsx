"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Plus, Trash2 } from "lucide-react";
import {
  deleteDocumentAction,
  updateDocumentAction,
} from "@/app/actions/documents";
import { DocumentCanvas } from "@/components/documents/DocumentCanvas";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentTemplateDef } from "@/lib/documents/types";
import type {
  BrochureDocumentContent,
  DocumentContent,
  DocumentLanguage,
  InvoiceDocumentContent,
  LineItem,
  ProfileDocumentContent,
  QuotationDocumentContent,
} from "@/lib/documents/types";

type Props = {
  documentId: string;
  initialTitle: string;
  initialLanguage: DocumentLanguage;
  initialStatus: "draft" | "final";
  initialContent: DocumentContent;
  template: DocumentTemplateDef;
};

export function DocumentEditor({
  documentId,
  initialTitle,
  initialLanguage,
  initialStatus,
  initialContent,
  template,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [language, setLanguage] = useState<DocumentLanguage>(initialLanguage);
  const [status, setStatus] = useState<"draft" | "final">(initialStatus);
  const [content, setContent] = useState<DocumentContent>(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState({
    title: initialTitle,
    language: initialLanguage,
    status: initialStatus,
    content: initialContent,
  });
  const [pending, startTransition] = useTransition();

  const dirty =
    title !== saved.title ||
    language !== saved.language ||
    status !== saved.status ||
    JSON.stringify(content) !== JSON.stringify(saved.content);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const preview = useMemo(
    () => (
      <DocumentCanvas content={content} template={template} language={language} />
    ),
    [content, template, language],
  );

  function save() {
    setMessage(null);
    setError(null);
    const formData = new FormData();
    formData.set("id", documentId);
    formData.set("title", title);
    formData.set("language", language);
    formData.set("status", status);
    formData.set("content", JSON.stringify(content));

    startTransition(async () => {
      const result = await updateDocumentAction({}, formData);
      if (result.error) setError(result.error);
      else {
        setMessage(result.success || "تم الحفظ");
        setSaved({ title, language, status, content });
      }
    });
  }

  function remove() {
    if (!confirm("هل تريد حذف هذا المستند؟")) return;
    startTransition(async () => {
      const result = await deleteDocumentAction(documentId);
      if (result.error) setError(result.error);
      else router.push("/documents");
    });
  }

  function goBack() {
    if (dirty && !confirm("لديك تعديلات غير محفوظة. هل تريد المغادرة؟")) return;
    router.push("/documents");
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={goBack} className="no-print text-start">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-amber-700">
          ← رجوع إلى مستنداتي
        </span>
      </button>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-amber-600">{template.nameAr}</p>
          <h1 className="text-2xl font-black text-[#071426]">محرر المستند</h1>
          {dirty && (
            <p className="mt-1 text-xs font-bold text-amber-700">
              توجد تعديلات غير محفوظة
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton documentTitle={title || template.nameAr} />
          <Button type="button" variant="outline" onClick={remove} disabled={pending}>
            حذف
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? "جاري الحفظ..." : "حفظ المستند"}
          </Button>
        </div>
      </div>

      {(error || message) && (
        <p className={`no-print text-sm ${error ? "text-rose-600" : "text-teal-700"}`}>
          {error || message}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="document-editor-panel no-print space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="document-editor-scroll space-y-4 pe-1">
            <div>
              <Label>عنوان المستند</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>اللغة</Label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as DocumentLanguage)}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="bilingual">ثنائي اللغة</option>
                </Select>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "final")}
                >
                  <option value="draft">مسودة</option>
                  <option value="final">نهائي</option>
                </Select>
              </div>
            </div>

            <CompanyFields
              content={content}
              onChange={(company) => setContent({ ...content, company })}
            />

            {content.kind === "company_profile" && (
              <ProfileFields
                content={content}
                onChange={setContent}
              />
            )}
            {content.kind === "quotation" && (
              <QuotationFields content={content} onChange={setContent} />
            )}
            {content.kind === "invoice" && (
              <InvoiceFields content={content} onChange={setContent} />
            )}
            {content.kind === "service_brochure" && (
              <BrochureFields content={content} onChange={setContent} />
            )}
          </div>
        </div>

        <div className="document-print-root overflow-auto rounded-3xl border border-slate-200 bg-slate-100/80 p-4 md:p-6">
          {preview}
        </div>
      </div>
    </div>
  );
}

function CompanyFields({
  content,
  onChange,
}: {
  content: DocumentContent;
  onChange: (company: DocumentContent["company"]) => void;
}) {
  const company = content.company;
  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
      <legend className="px-1 text-xs font-black text-slate-500">بيانات الشركة</legend>
      <Field
        label="الاسم بالعربي"
        value={company.nameAr}
        onChange={(v) => onChange({ ...company, nameAr: v })}
      />
      <Field
        label="الاسم بالإنجليزي"
        value={company.nameEn || ""}
        onChange={(v) => onChange({ ...company, nameEn: v })}
      />
      <Field
        label="الهاتف"
        value={company.phone || ""}
        onChange={(v) => onChange({ ...company, phone: v })}
      />
      <Field
        label="البريد"
        value={company.email || ""}
        onChange={(v) => onChange({ ...company, email: v })}
      />
      <Field
        label="العنوان"
        value={company.address || ""}
        onChange={(v) => onChange({ ...company, address: v })}
      />
    </fieldset>
  );
}

function ProfileFields({
  content,
  onChange,
}: {
  content: ProfileDocumentContent;
  onChange: (content: DocumentContent) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
      <legend className="px-1 text-xs font-black text-slate-500">محتوى البروفايل</legend>
      <Field
        label="الشعار المختصر"
        value={content.tagline || ""}
        onChange={(v) => onChange({ ...content, tagline: v })}
      />
      <TextField
        label="نبذة عربية"
        value={content.company.aboutAr || ""}
        onChange={(v) =>
          onChange({ ...content, company: { ...content.company, aboutAr: v } })
        }
      />
      <TextField
        label="الخدمات"
        value={content.company.servicesAr || ""}
        onChange={(v) =>
          onChange({ ...content, company: { ...content.company, servicesAr: v } })
        }
      />
      <TextField
        label="الخبرات"
        value={content.company.experienceAr || ""}
        onChange={(v) =>
          onChange({
            ...content,
            company: { ...content.company, experienceAr: v },
          })
        }
      />
      <div className="grid grid-cols-2 gap-2 text-xs">
        {(
          [
            ["showAbout", "نبذة"],
            ["showServices", "خدمات"],
            ["showExperience", "خبرات"],
            ["showContact", "تواصل"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 font-bold text-slate-600">
            <input
              type="checkbox"
              checked={content[key]}
              onChange={(e) => onChange({ ...content, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuotationFields({
  content,
  onChange,
}: {
  content: QuotationDocumentContent;
  onChange: (content: QuotationDocumentContent) => void;
}) {
  return (
    <>
      <ClientFields
        content={content}
        onChange={(patch) =>
          onChange({ ...content, ...patch, kind: "quotation" })
        }
      />
      <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
        <legend className="px-1 text-xs font-black text-slate-500">بيانات العرض</legend>
        <Field
          label="رقم العرض"
          value={content.quoteNumber}
          onChange={(v) => onChange({ ...content, quoteNumber: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="تاريخ الإصدار"
            type="date"
            value={content.issueDate}
            onChange={(v) => onChange({ ...content, issueDate: v })}
          />
          <Field
            label="صالح حتى"
            type="date"
            value={content.validUntil}
            onChange={(v) => onChange({ ...content, validUntil: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="العملة"
            value={content.currency}
            onChange={(v) => onChange({ ...content, currency: v })}
          />
          <Field
            label="نسبة الضريبة %"
            type="number"
            value={String(content.taxRate)}
            onChange={(v) => onChange({ ...content, taxRate: Number(v) || 0 })}
          />
        </div>
        <LineItemsEditor
          items={content.items}
          onChange={(items) => onChange({ ...content, items })}
        />
        <TextField
          label="ملاحظات"
          value={content.notes || ""}
          onChange={(v) => onChange({ ...content, notes: v })}
        />
        <TextField
          label="الشروط"
          value={content.terms || ""}
          onChange={(v) => onChange({ ...content, terms: v })}
        />
      </fieldset>
    </>
  );
}

function InvoiceFields({
  content,
  onChange,
}: {
  content: InvoiceDocumentContent;
  onChange: (content: InvoiceDocumentContent) => void;
}) {
  return (
    <>
      <ClientFields
        content={content}
        onChange={(patch) =>
          onChange({ ...content, ...patch, kind: "invoice" })
        }
      />
      <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
        <legend className="px-1 text-xs font-black text-slate-500">بيانات الفاتورة</legend>
        <Field
          label="رقم الفاتورة"
          value={content.invoiceNumber}
          onChange={(v) => onChange({ ...content, invoiceNumber: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="تاريخ الإصدار"
            type="date"
            value={content.issueDate}
            onChange={(v) => onChange({ ...content, issueDate: v })}
          />
          <Field
            label="تاريخ الاستحقاق"
            type="date"
            value={content.dueDate}
            onChange={(v) => onChange({ ...content, dueDate: v })}
          />
        </div>
        <div>
          <Label>حالة الدفع</Label>
          <Select
            value={content.paymentStatus}
            onChange={(e) =>
              onChange({
                ...content,
                paymentStatus: e.target.value as InvoiceDocumentContent["paymentStatus"],
              })
            }
          >
            <option value="unpaid">غير مدفوعة</option>
            <option value="partial">مدفوعة جزئياً</option>
            <option value="paid">مدفوعة</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="العملة"
            value={content.currency}
            onChange={(v) => onChange({ ...content, currency: v })}
          />
          <Field
            label="نسبة الضريبة %"
            type="number"
            value={String(content.taxRate)}
            onChange={(v) => onChange({ ...content, taxRate: Number(v) || 0 })}
          />
        </div>
        <LineItemsEditor
          items={content.items}
          onChange={(items) => onChange({ ...content, items })}
        />
        <TextField
          label="ملاحظات بنكية"
          value={content.bankNotes || ""}
          onChange={(v) => onChange({ ...content, bankNotes: v })}
        />
        <TextField
          label="ملاحظات"
          value={content.notes || ""}
          onChange={(v) => onChange({ ...content, notes: v })}
        />
      </fieldset>
    </>
  );
}

function BrochureFields({
  content,
  onChange,
}: {
  content: BrochureDocumentContent;
  onChange: (content: DocumentContent) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
      <legend className="px-1 text-xs font-black text-slate-500">عرض الخدمات</legend>
      <Field
        label="الشعار"
        value={content.tagline}
        onChange={(v) => onChange({ ...content, tagline: v })}
      />
      <TextField
        label="مقدمة"
        value={content.intro}
        onChange={(v) => onChange({ ...content, intro: v })}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>الخدمات</Label>
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1 px-2 text-xs"
            onClick={() =>
              onChange({
                ...content,
                services: [
                  ...content.services,
                  {
                    id: nanoid(8),
                    title: "خدمة جديدة",
                    description: "وصف مختصر للخدمة",
                  },
                ],
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة
          </Button>
        </div>
        {content.services.map((service, index) => (
          <div key={service.id} className="space-y-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">خدمة {index + 1}</p>
              <button
                type="button"
                className="text-rose-500"
                onClick={() =>
                  onChange({
                    ...content,
                    services: content.services.filter((s) => s.id !== service.id),
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input
              value={service.title}
              onChange={(e) => {
                const services = content.services.map((s) =>
                  s.id === service.id ? { ...s, title: e.target.value } : s,
                );
                onChange({ ...content, services });
              }}
            />
            <Textarea
              value={service.description}
              onChange={(e) => {
                const services = content.services.map((s) =>
                  s.id === service.id ? { ...s, description: e.target.value } : s,
                );
                onChange({ ...content, services });
              }}
            />
          </div>
        ))}
      </div>
      <TextField
        label="المميزات (سطر لكل ميزة)"
        value={content.features.join("\n")}
        onChange={(v) =>
          onChange({
            ...content,
            features: v
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          })
        }
      />
      <TextField
        label="نطاق العمل"
        value={content.scope}
        onChange={(v) => onChange({ ...content, scope: v })}
      />
      <Field
        label="دعوة للتواصل"
        value={content.cta}
        onChange={(v) => onChange({ ...content, cta: v })}
      />
    </fieldset>
  );
}

function ClientFields({
  content,
  onChange,
}: {
  content: QuotationDocumentContent | InvoiceDocumentContent;
  onChange: (
    patch: Partial<
      Pick<
        QuotationDocumentContent,
        "clientName" | "clientEmail" | "clientPhone" | "clientAddress"
      >
    >,
  ) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-3">
      <legend className="px-1 text-xs font-black text-slate-500">بيانات العميل</legend>
      <Field
        label="اسم العميل"
        value={content.clientName}
        onChange={(v) => onChange({ clientName: v })}
      />
      <Field
        label="البريد"
        value={content.clientEmail || ""}
        onChange={(v) => onChange({ clientEmail: v })}
      />
      <Field
        label="الهاتف"
        value={content.clientPhone || ""}
        onChange={(v) => onChange({ clientPhone: v })}
      />
      <Field
        label="العنوان"
        value={content.clientAddress || ""}
        onChange={(v) => onChange({ clientAddress: v })}
      />
    </fieldset>
  );
}

function LineItemsEditor({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>البنود</Label>
        <Button
          type="button"
          variant="outline"
          className="h-8 gap-1 px-2 text-xs"
          onClick={() =>
            onChange([
              ...items,
              {
                id: nanoid(8),
                description: "بند جديد",
                quantity: 1,
                unitPrice: 0,
                unit: "بند",
              },
            ])
          }
        >
          <Plus className="h-3.5 w-3.5" />
          بند
        </Button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="space-y-2 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">بند</p>
            <button
              type="button"
              className="text-rose-500"
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input
            value={item.description}
            onChange={(e) =>
              onChange(
                items.map((i) =>
                  i.id === item.id ? { ...i, description: e.target.value } : i,
                ),
              )
            }
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === item.id
                      ? { ...i, quantity: Number(e.target.value) || 0 }
                      : i,
                  ),
                )
              }
            />
            <Input
              type="number"
              value={item.unitPrice}
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === item.id
                      ? { ...i, unitPrice: Number(e.target.value) || 0 }
                      : i,
                  ),
                )
              }
            />
            <Input
              value={item.unit || ""}
              placeholder="الوحدة"
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === item.id ? { ...i, unit: e.target.value } : i,
                  ),
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
