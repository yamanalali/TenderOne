"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, ShoppingCart } from "lucide-react";
import { createPaymentOrderAction } from "@/app/actions/payments";
import type { ActionState } from "@/app/actions/auth";
import type { Product } from "@/lib/db/schema";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { getProductDestination } from "@/lib/product-destination";

function getPurchaseDetails(product: Product) {
  const metadata = product.metadata as {
    serviceCode?: string;
    templateCode?: string;
  } | null;

  if (product.type === "analysis_credit") {
    const credits = product.credits || 1;
    return {
      category: "تحليل المناقصات",
      summary: `يشمل ${credits} ${credits === 1 ? "تحليل" : "تحليلات"} لدفاتر الشروط.`,
      points: [
        "كل تحليل مخصص لملف PDF واحد",
        "استخراج المطلوبات والمخاطر وقائمة التحقق",
      ],
    };
  }

  if (product.type === "company_profile") {
    return {
      category: "ملف الشركة",
      summary: "يفتح منشئ ملف الشركة، وليس تصميماً واحداً فقط.",
      points: [
        "يشمل التصاميم الثلاثة: الرسمي، العصري، والفاخر",
        "اختيار العربية أو الإنجليزية أو النسخة الثنائية",
        "معاينة وطباعة PDF",
      ],
    };
  }

  if (
    product.type === "service" &&
    metadata?.serviceCode === "documents_pack"
  ) {
    return {
      category: "باقة المستندات",
      summary: "باقة كاملة تشمل جميع أنواع وتصاميم المستندات.",
      points: [
        "4 أنواع: ملف شركة، عرض سعر، فاتورة، وعرض خدمات",
        "3 تصاميم لكل نوع: رسمي، عصري، وفاخر",
        "المجموع 12 تصميماً مع المحرر والطباعة PDF",
      ],
    };
  }

  if (product.type === "template") {
    return {
      category: "نموذج جاهز للتنزيل",
      summary: `شراء النموذج المذكور بالاسم فقط: ${product.nameAr}.`,
      points: [
        "ملف مستقل جاهز للتنزيل والاستخدام",
        `رمز النموذج: ${metadata?.templateCode || "غير محدد"}`,
      ],
    };
  }

  return {
    category: "خدمة",
    summary: product.descriptionAr || "خدمة مستقلة لحساب شركتك.",
    points: ["راجع اسم الخدمة ووصفها قبل إتمام التحويل"],
  };
}

const PRODUCT_GROUPS: {
  key: string;
  label: string;
  description: string;
  match: (product: Product) => boolean;
  help?: { href: string; label: string };
}[] = [
  {
    key: "packages",
    label: "الباقات والخدمات",
    description: "باقات شاملة تفتح أكثر من أداة دفعة واحدة.",
    match: (p) => p.type === "service" || p.type === "bundle",
    help: {
      href: "/templates",
      label: "شاهد التصاميم الـ 12 قبل الشراء",
    },
  },
  {
    key: "analysis",
    label: "تحليل المناقصات",
    description: "رصيد لتحليل دفاتر الشروط بملفات PDF.",
    match: (p) => p.type === "analysis_credit",
  },
  {
    key: "profile",
    label: "ملف الشركة",
    description: "منشئ الملف التعريفي الاحترافي لشركتك.",
    match: (p) => p.type === "company_profile",
  },
  {
    key: "templates",
    label: "نماذج جاهزة للتنزيل",
    description: "ملفات تشغيلية مستقلة (Excel) تُنزّل ببيانات شركتك.",
    match: (p) => p.type === "template",
    help: {
      href: "/templates#downloads",
      label: "استعرض تفاصيل النماذج في المكتبة",
    },
  },
];

export function PaymentForm({
  products,
  bankName,
  bankAccountName,
  bankIban,
  initialProductId = "",
}: {
  products: Product[];
  bankName: string;
  bankAccountName: string;
  bankIban: string;
  initialProductId?: string;
}) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  const validInitialProductId = products.some(
    (product) => product.id === initialProductId,
  )
    ? initialProductId
    : "";
  const [productId, setProductId] = useState(validInitialProductId);
  const [receipt, setReceipt] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);

  const selected = products.find((p) => p.id === productId);
  const selectedDestination = selected
    ? getProductDestination(selected)
    : null;

  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await createPaymentOrderAction(prev, formData);
      if (result.success) {
        toast(
          "تم إرسال طلبك. ستراجع الإدارة التحويل ثم تفعّل الخدمة على حسابك.",
          "success",
        );
        setFormKey((k) => k + 1);
        setProductId("");
        setReceipt(null);
        formRef.current?.reset();
      }
      return result;
    },
    {} as ActionState,
  );

  return (
    <div className="space-y-6">
      <form
        key={formKey}
        ref={formRef}
        action={formAction}
        className="grid items-start gap-6 lg:grid-cols-2"
      >
        <Card className="lg:min-h-[680px]">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-black text-amber-800">
              1
            </span>
            <div>
              <CardTitle>اختر ما تريد شراءه</CardTitle>
              <CardDescription className="mt-1">
                اضغط على المنتج لعرض محتوياته كاملة قبل التحويل.
              </CardDescription>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {PRODUCT_GROUPS.map((group) => {
              const groupProducts = products.filter(group.match);
              if (groupProducts.length === 0) return null;
              return (
                <div key={group.key}>
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-black text-[#071426]">{group.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {group.description}
                      </p>
                    </div>
                    {group.help && (
                      <Link
                        href={group.help.href}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 underline underline-offset-4 hover:text-amber-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {group.help.label}
                      </Link>
                    )}
                  </div>
                  <div className="space-y-2">
                    {groupProducts.map((product) => {
                      const details = getPurchaseDetails(product);
                      const isSelected = product.id === productId;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setProductId(product.id)}
                          className={`relative flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-right transition ${
                            isSelected
                              ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                              : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute left-3 top-3 h-5 w-5 text-amber-700" />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="pe-6 text-base font-black text-[#071426]">
                              {product.nameAr}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {product.descriptionAr || details.summary}
                            </p>
                          </div>
                          <div className="shrink-0 border-r border-slate-100 pr-4 text-left">
                            <span className="text-xl font-black text-[#071426]">
                              {product.price}
                            </span>
                            <span className="block text-xs font-bold text-slate-500">
                              {product.currency}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <input type="hidden" name="productId" value={productId} />
        </Card>

        <div className="space-y-4 lg:sticky lg:top-6">
          <Card className="overflow-hidden border-slate-300 p-0">
            <div className="bg-[#071426] p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300 font-black text-[#071426]">
                  2
                </span>
                <div>
                  <CardTitle className="text-white">معلومات الدفع</CardTitle>
                  <p className="mt-1 text-sm text-slate-300">
                    راجع طلبك ثم حوّل المبلغ وارفع الإيصال.
                  </p>
                </div>
              </div>

              {selected && selectedDestination ? (
                (() => {
                  const details = getPurchaseDetails(selected);
                  return (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-amber-300">
                            الخدمة المختارة
                          </p>
                          <p className="mt-1 font-black">{selected.nameAr}</p>
                        </div>
                        <p className="shrink-0 text-xl font-black text-amber-300">
                          {selected.price}{" "}
                          <span className="text-xs">{selected.currency}</span>
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {details.summary}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {details.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300">
                        بعد الموافقة:{" "}
                        <span className="font-black text-white">
                          {selectedDestination.label}
                        </span>
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-amber-300/40 bg-white/5 p-5 text-center text-sm text-slate-300">
                  اختر خدمة من القسم المقابل لتظهر قيمة الطلب وتتمكن من إرسال
                  إثبات التحويل.
                </div>
              )}
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="font-black text-slate-900">الحساب البنكي</p>
                <p className="mt-1 text-xs text-slate-500">
                  حوّل قيمة الخدمة المختارة إلى البيانات التالية.
                </p>
              </div>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">اسم البنك</p>
                    <p className="mt-0.5 font-bold">{bankName}</p>
                  </div>
                  <CopyButton value={bankName} label="نسخ البنك" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">اسم الحساب</p>
                    <p className="mt-0.5 font-bold">{bankAccountName}</p>
                  </div>
                  <CopyButton value={bankAccountName} label="نسخ الاسم" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">رقم IBAN</p>
                    <p className="mt-0.5 font-mono text-xs font-bold sm:text-sm">
                      {bankIban}
                    </p>
                  </div>
                  <CopyButton
                    value={bankIban.replace(/\s+/g, "")}
                    label="نسخ IBAN"
                  />
                </div>
              </div>

              {selected ? (
                <div className="space-y-4 border-t border-slate-200 pt-5">
                  <div>
                    <p className="font-black text-slate-900">
                      إثبات التحويل
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      اكتب المرجع وارفع صورة أو PDF للإيصال.
                    </p>
                  </div>
                <div>
                  <Label>مرجع التحويل</Label>
                  <Input name="transferReference" required />
                </div>
                <div>
                  <Label>ملاحظة (اختياري)</Label>
                  <Textarea name="transferNote" />
                </div>
                <UploadButton
                  label="إشعار التحويل (صورة أو PDF)"
                  accept="image/*,application/pdf"
                  onUploaded={setReceipt}
                />
                <input
                  type="hidden"
                  name="receiptUrl"
                  value={receipt?.url || ""}
                />
                <input
                  type="hidden"
                  name="receiptPathname"
                  value={receipt?.pathname || ""}
                />
                {state.error && (
                  <p className="text-sm text-rose-600">{state.error}</p>
                )}
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={pending || !receipt || !productId}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {pending
                    ? "جاري الإرسال..."
                    : `إرسال طلب ${selected.nameAr}`}
                </Button>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 p-4 text-center text-sm font-bold text-slate-500">
                  اختر الخدمة أولاً لإكمال بيانات التحويل
                </div>
              )}
            </div>
          </Card>
        </div>
      </form>

      {state.success && (
        <Card className="border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
          <p className="font-black">تم إرسال الطلب بنجاح</p>
          <p className="mt-1 leading-6">
            تابع حالة طلبك من صفحة «خدماتي ورصيدي»، وبعد موافقة الإدارة ستظهر الخدمة
            هناك مع زر مباشر للاستخدام أو التنزيل.
          </p>
        </Card>
      )}
    </div>
  );
}
