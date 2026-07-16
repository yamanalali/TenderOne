"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  createProductAction,
  saveOpenAISettingsAction,
  saveSettingsAction,
  toggleCategoryAction,
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

export function PaymentReviewButtons({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewPaymentAction(orderId, "approved");
            router.refresh();
          })
        }
      >
        موافقة وتفعيل
      </Button>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewPaymentAction(
              orderId,
              "rejected",
              "مرفوض من الإدارة",
            );
            router.refresh();
          })
        }
      >
        رفض
      </Button>
    </div>
  );
}

export function ProductsList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardTitle>{product.nameAr}</CardTitle>
          <CardDescription>
            {product.type} — {product.price} {product.currency} —{" "}
            {product.isActive ? "نشط" : "معطّل"}
          </CardDescription>
        </Card>
      ))}
    </div>
  );
}
