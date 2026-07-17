"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import {
  createCategoryAction,
  createProductAction,
  deleteProductAction,
  saveOpenAISettingsAction,
  saveSettingsAction,
  toggleCategoryAction,
  updateProductAction,
} from "@/app/actions/admin";
import { createTenderAction } from "@/app/actions/tenders";
import { reviewPaymentAction } from "@/app/actions/payments";
import type { ActionState } from "@/app/actions/auth";
import type { AppSettings } from "@/lib/settings";
import type { Category, Product } from "@/lib/db/schema";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function TenderAdminForm({
  categories,
}: {
  categories: { id: string; nameAr: string }[];
}) {
  const [file, setFile] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);
  const [state, formAction, pending] = useActionState(
    createTenderAction,
    {} as ActionState,
  );

  return (
    <Card>
      <CardTitle>إضافة مناقصة</CardTitle>
      <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>العنوان</Label>
          <Input name="title" required />
        </div>
        <div>
          <Label>الجهة</Label>
          <Input name="agency" required />
        </div>
        <div>
          <Label>رقم المناقصة</Label>
          <Input name="referenceNumber" required />
        </div>
        <div>
          <Label>التصنيف</Label>
          <Select name="categoryId" defaultValue="">
            <option value="">بدون</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>المدينة</Label>
          <Input name="city" />
        </div>
        <div>
          <Label>تاريخ النشر</Label>
          <Input type="datetime-local" name="publishedAt" />
        </div>
        <div>
          <Label>آخر موعد للتقديم</Label>
          <Input type="datetime-local" name="deadlineAt" />
        </div>
        <div>
          <Label>تاريخ فتح العروض</Label>
          <Input type="datetime-local" name="openingAt" />
        </div>
        <div>
          <Label>مدة التنفيذ</Label>
          <Input name="executionDuration" />
        </div>
        <div>
          <Label>طريقة التسليم</Label>
          <Input name="deliveryMethod" />
        </div>
        <div>
          <Label>مكان التسليم</Label>
          <Input name="deliveryPlace" />
        </div>
        <div>
          <Label>رابط المنصة</Label>
          <Input name="platformUrl" />
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input name="contactEmail" type="email" />
        </div>
        <div className="md:col-span-2">
          <Label>الوصف</Label>
          <Textarea name="description" />
        </div>
        <div className="md:col-span-2">
          <UploadButton
            label="دفتر الشروط (اختياري)"
            onUploaded={setFile}
          />
          <input type="hidden" name="documentUrl" value={file?.url || ""} />
          <input
            type="hidden"
            name="documentPathname"
            value={file?.pathname || ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="isPublished" defaultChecked />
          نشر المناقصة
        </label>
        {state.error && (
          <p className="md:col-span-2 text-sm text-rose-600">{state.error}</p>
        )}
        {state.success && (
          <p className="md:col-span-2 text-sm text-teal-700">{state.success}</p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جاري الحفظ..." : "حفظ المناقصة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function CategoryAdminForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [toggling, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    {} as ActionState,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>إضافة تصنيف</CardTitle>
        <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <Label>الاسم عربي</Label>
            <Input name="nameAr" required />
          </div>
          <div>
            <Label>الاسم إنجليزي</Label>
            <Input name="nameEn" />
          </div>
          <div>
            <Label>الترتيب</Label>
            <Input name="sortOrder" type="number" defaultValue={0} />
          </div>
          {state.error && (
            <p className="text-sm text-rose-600 md:col-span-3">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-teal-700 md:col-span-3">{state.success}</p>
          )}
          <div className="md:col-span-3">
            <Button type="submit" disabled={pending}>
              إضافة
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-3">
        {categories.map((category) => (
          <Card key={category.id} className="flex items-center justify-between">
            <div>
              <CardTitle>{category.nameAr}</CardTitle>
              <CardDescription>
                {category.isActive ? "مفعّل" : "معطّل"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              disabled={toggling}
              onClick={() =>
                startTransition(async () => {
                  await toggleCategoryAction(category.id, !category.isActive);
                  router.refresh();
                })
              }
            >
              {category.isActive ? "تعطيل" : "تفعيل"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

type AdminSettings = AppSettings & {
  openAIModel: string;
  openAIConfigured: boolean;
  openAIConfiguredInAdmin: boolean;
};

export function SettingsAdminForm({ settings }: { settings: AdminSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    {} as ActionState,
  );
  const [openAIState, openAIFormAction, openAIPending] = useActionState(
    saveOpenAISettingsAction,
    {} as ActionState,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>مفتاح OpenAI العام</CardTitle>
        <CardDescription>
          يُضبط مرة واحدة من حساب المدير ويُستخدم لتحليل ملفات جميع الشركات.
          لا يظهر المفتاح للمستخدمين أو في المتصفح.
        </CardDescription>
        <form action={openAIFormAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              مفتاح OpenAI{" "}
              {settings.openAIConfigured
                ? settings.openAIConfiguredInAdmin
                  ? "(محفوظ ومشفّر في إعدادات الإدارة)"
                  : "(مفعّل من بيئة الخادم)"
                : "(غير مضبوط)"}
            </Label>
            <Input
              type="password"
              name="openaiApiKey"
              autoComplete="new-password"
              placeholder={
                settings.openAIConfigured
                  ? "اتركه فارغاً للاحتفاظ بالمفتاح الحالي"
                  : "sk-..."
              }
            />
          </div>
          <div>
            <Label>نموذج التحليل</Label>
            <Input name="openaiModel" defaultValue={settings.openAIModel} />
          </div>
          {openAIState.error && (
            <p className="text-sm text-rose-600 md:col-span-2">
              {openAIState.error}
            </p>
          )}
          {openAIState.success && (
            <p className="text-sm text-teal-700 md:col-span-2">
              {openAIState.success}
            </p>
          )}
          <div className="md:col-span-2">
            <Button type="submit" disabled={openAIPending}>
              {openAIPending ? "جاري الحفظ..." : "حفظ إعدادات OpenAI"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>إعدادات النظام</CardTitle>
        <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>أيام «تنتهي قريباً»</Label>
          <Input
            type="number"
            name="endingSoonDays"
            defaultValue={settings.endingSoonDays}
          />
        </div>
        <div>
          <Label>أيام «جديدة»</Label>
          <Input
            type="number"
            name="newTenderDays"
            defaultValue={settings.newTenderDays}
          />
        </div>
        <div>
          <Label>اسم البنك</Label>
          <Input name="bankName" defaultValue={settings.bankName} />
        </div>
        <div>
          <Label>اسم الحساب</Label>
          <Input
            name="bankAccountName"
            defaultValue={settings.bankAccountName}
          />
        </div>
        <div className="md:col-span-2">
          <Label>IBAN</Label>
          <Input name="bankIban" defaultValue={settings.bankIban} />
        </div>
        <div>
          <Label>الحد الأقصى للرفع (MB)</Label>
          <Input
            type="number"
            name="maxUploadMb"
            defaultValue={settings.maxUploadMb}
          />
        </div>
        {state.error && (
          <p className="text-sm text-rose-600 md:col-span-2">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-teal-700 md:col-span-2">{state.success}</p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            حفظ الإعدادات
          </Button>
        </div>
        </form>
      </Card>
    </div>
  );
}

export function ProductAdminForm() {
  const [file, setFile] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);
  const [state, formAction, pending] = useActionState(
    createProductAction,
    {} as ActionState,
  );

  return (
    <Card>
      <CardTitle>إضافة منتج / نموذج</CardTitle>
      <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>النوع</Label>
          <Select name="type" defaultValue="template">
            <option value="template">نموذج</option>
            <option value="analysis_credit">رصيد تحليل</option>
            <option value="company_profile">ملف شركة</option>
            <option value="service">خدمة</option>
            <option value="bundle">باقة</option>
          </Select>
        </div>
        <div>
          <Label>السعر</Label>
          <Input name="price" defaultValue="49" />
        </div>
        <div>
          <Label>الاسم عربي</Label>
          <Input name="nameAr" required />
        </div>
        <div>
          <Label>الاسم إنجليزي</Label>
          <Input name="nameEn" />
        </div>
        <div className="md:col-span-2">
          <Label>الوصف</Label>
          <Textarea name="descriptionAr" />
        </div>
        <div>
          <Label>عدد الأرصدة (للتحليل)</Label>
          <Input name="credits" type="number" defaultValue={0} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked />
          نشط
        </label>
        <div className="md:col-span-2">
          <UploadButton
            label="ملف النموذج (اختياري)"
            accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onUploaded={setFile}
          />
          <input type="hidden" name="fileUrl" value={file?.url || ""} />
          <input type="hidden" name="filePathname" value={file?.pathname || ""} />
          <input type="hidden" name="fileName" value={file?.fileName || ""} />
        </div>
        {state.error && (
          <p className="text-sm text-rose-600 md:col-span-2">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-teal-700 md:col-span-2">{state.success}</p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            حفظ المنتج
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function PaymentReviewButtons({
  orderId,
  receiptUrl,
}: {
  orderId: string;
  receiptUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {receiptUrl && (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-bold text-teal-700 underline"
        >
          معاينة إشعار التحويل
        </a>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pending}
          onClick={() => {
            if (!confirm("تأكيد الموافقة وتفعيل الخدمة لهذا الطلب؟")) return;
            startTransition(async () => {
              const result = await reviewPaymentAction(orderId, "approved");
              setFeedback(result.success || result.error || null);
              router.refresh();
            });
          }}
        >
          موافقة وتفعيل
        </Button>
        <Button
          variant="danger"
          disabled={pending}
          onClick={() => setShowReject((v) => !v)}
        >
          رفض
        </Button>
      </div>
      {showReject && (
        <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3">
          <Label>سبب الرفض (يظهر للعميل)</Label>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="مثال: الإيصال غير واضح أو المبلغ غير مطابق"
          />
          <Button
            variant="danger"
            disabled={pending || rejectNote.trim().length < 3}
            onClick={() => {
              if (!confirm("تأكيد رفض الطلب؟")) return;
              startTransition(async () => {
                const result = await reviewPaymentAction(
                  orderId,
                  "rejected",
                  rejectNote.trim(),
                );
                setFeedback(result.success || result.error || null);
                setShowReject(false);
                router.refresh();
              });
            }}
          >
            تأكيد الرفض
          </Button>
        </div>
      )}
      {feedback && (
        <p className="text-sm font-semibold text-teal-700">{feedback}</p>
      )}
    </div>
  );
}

export function ProductsList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-3">
      {products.map((product) => (
        <ProductAdminRow key={product.id} product={product} />
      ))}
    </div>
  );
}

const productTypeLabels: Record<Product["type"], string> = {
  template: "نموذج",
  analysis_credit: "رصيد تحليل",
  company_profile: "ملف شركة",
  service: "خدمة",
  bundle: "باقة",
};

function ProductAdminRow({ product }: { product: Product }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionState>({});

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProductAction(product.id, formData);
      setFeedback(result);
      if (result.success) {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `هل تريد حذف «${product.nameAr}» نهائياً؟ لا يمكن التراجع عن الحذف.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      setFeedback(result);
      if (result.success) router.refresh();
    });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{product.nameAr}</CardTitle>
            <span
              className={
                product.isActive
                  ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                  : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
              }
            >
              {product.isActive ? "نشط" : "معطّل"}
            </span>
          </div>
          <CardDescription>
            {productTypeLabels[product.type]} — {product.price}{" "}
            {product.currency}
            {product.type === "analysis_credit" && product.credits
              ? ` — ${product.credits} رصيد`
              : ""}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={pending}
            onClick={() => {
              setEditing((value) => !value);
              setFeedback({});
            }}
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "إلغاء" : "تعديل"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            className="gap-1.5"
            disabled={pending}
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </Button>
        </div>
      </div>

      {editing && (
        <form
          onSubmit={handleUpdate}
          className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"
        >
          <div>
            <Label>النوع</Label>
            <Select name="type" defaultValue={product.type}>
              <option value="template">نموذج</option>
              <option value="analysis_credit">رصيد تحليل</option>
              <option value="company_profile">ملف شركة</option>
              <option value="service">خدمة</option>
              <option value="bundle">باقة</option>
            </Select>
          </div>
          <div>
            <Label>الاسم عربي</Label>
            <Input name="nameAr" defaultValue={product.nameAr} required />
          </div>
          <div>
            <Label>الاسم إنجليزي</Label>
            <Input name="nameEn" defaultValue={product.nameEn || ""} />
          </div>
          <div>
            <Label>السعر</Label>
            <Input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.price}
              required
            />
          </div>
          <div>
            <Label>العملة</Label>
            <Input
              name="currency"
              defaultValue={product.currency}
              maxLength={10}
              required
            />
          </div>
          <div>
            <Label>عدد الأرصدة (للتحليل)</Label>
            <Input
              name="credits"
              type="number"
              min="0"
              defaultValue={product.credits || 0}
            />
          </div>
          <div className="md:col-span-2">
            <Label>الوصف العربي</Label>
            <Textarea
              name="descriptionAr"
              defaultValue={product.descriptionAr || ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product.isActive}
            />
            المنتج نشط ومتاح للشراء
          </label>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      )}

      {feedback.error && (
        <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {feedback.error}
        </p>
      )}
      {feedback.success && (
        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {feedback.success}
        </p>
      )}
    </Card>
  );
}
