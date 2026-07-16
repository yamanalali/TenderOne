"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createCompanyProfileAction,
  updateCompanyDataAction,
} from "@/app/actions/company-profile";
import type { ActionState } from "@/app/actions/auth";
import { PROFILE_TEMPLATES } from "@/lib/company-profile-templates";
import type { Company } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CompanyDataForm({ company }: { company: Company }) {
  const [state, formAction, pending] = useActionState(
    updateCompanyDataAction,
    {} as ActionState,
  );

  return (
    <Card>
      <CardTitle>بيانات الشركة</CardTitle>
      <CardDescription>تُدخل مرة واحدة وتُستخدم لإنشاء ملفات التعريف</CardDescription>
      <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>اسم الشركة (عربي)</Label>
          <Input name="nameAr" defaultValue={company.nameAr} required />
        </div>
        <div>
          <Label>اسم الشركة (إنجليزي)</Label>
          <Input name="nameEn" defaultValue={company.nameEn || ""} />
        </div>
        <div>
          <Label>السجل التجاري</Label>
          <Input
            name="commercialRegister"
            defaultValue={company.commercialRegister || ""}
          />
        </div>
        <div>
          <Label>البطاقة الضريبية</Label>
          <Input name="taxCard" defaultValue={company.taxCard || ""} />
        </div>
        <div>
          <Label>المدينة</Label>
          <Input name="city" defaultValue={company.city || ""} />
        </div>
        <div>
          <Label>الدولة</Label>
          <Input name="country" defaultValue={company.country || ""} />
        </div>
        <div>
          <Label>الهاتف</Label>
          <Input name="phone" defaultValue={company.phone || ""} />
        </div>
        <div>
          <Label>البريد</Label>
          <Input name="email" type="email" defaultValue={company.email || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>العنوان</Label>
          <Input name="address" defaultValue={company.address || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>الموقع</Label>
          <Input name="website" defaultValue={company.website || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>نبذة عربية</Label>
          <Textarea name="aboutAr" defaultValue={company.aboutAr || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>نبذة إنجليزية</Label>
          <Textarea name="aboutEn" defaultValue={company.aboutEn || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>الخدمات (عربي)</Label>
          <Textarea name="servicesAr" defaultValue={company.servicesAr || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>الخدمات (إنجليزي)</Label>
          <Textarea name="servicesEn" defaultValue={company.servicesEn || ""} />
        </div>
        <div className="md:col-span-2">
          <Label>الخبرات (عربي)</Label>
          <Textarea
            name="experienceAr"
            defaultValue={company.experienceAr || ""}
          />
        </div>
        <div className="md:col-span-2">
          <Label>الخبرات (إنجليزي)</Label>
          <Textarea
            name="experienceEn"
            defaultValue={company.experienceEn || ""}
          />
        </div>
        {state.error && (
          <p className="md:col-span-2 text-sm text-rose-600">{state.error}</p>
        )}
        {state.success && (
          <p className="md:col-span-2 text-sm text-teal-700">{state.success}</p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جاري الحفظ..." : "حفظ بيانات الشركة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function CreateProfileForm({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await createCompanyProfileAction(prev, formData);
      if (result.success && result.success.length > 20) {
        router.push(`/company-profile/${result.success}`);
      }
      return result;
    },
    {},
  );

  return (
    <Card>
      <CardTitle>إنشاء ملف تعريف</CardTitle>
      <CardDescription>
        اختر القالب واللغة.{" "}
        {!hasAccess && "يلزم تفعيل الخدمة من صفحة الدفع أولاً."}
      </CardDescription>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label>عنوان الملف</Label>
          <Input name="title" defaultValue="ملف تعريف الشركة" />
        </div>
        <div>
          <Label>القالب</Label>
          <Select name="templateKey" defaultValue="classic">
            {PROFILE_TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.nameAr} / {t.nameEn}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>اللغة</Label>
          <Select name="language" defaultValue="ar">
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="bilingual">ثنائي اللغة</option>
          </Select>
        </div>
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        <Button type="submit" disabled={pending || !hasAccess}>
          {pending ? "جاري الإنشاء..." : "إنشاء ملف التعريف"}
        </Button>
      </form>
    </Card>
  );
}
