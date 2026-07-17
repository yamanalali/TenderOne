"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function TenderFilters({
  categories,
  agencies,
  cities,
}: {
  categories: { id: string; nameAr: string }[];
  agencies: string[];
  cities: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (String(value)) params.set(key, String(value));
    }
    router.push(`/tenders?${params.toString()}`);
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-4">
      <div>
        <Label>بحث</Label>
        <Input
          name="q"
          defaultValue={searchParams.get("q") || ""}
          placeholder="عنوان / جهة / رقم"
        />
      </div>
      <div>
        <Label>التصنيف</Label>
        <Select name="categoryId" defaultValue={searchParams.get("categoryId") || ""}>
          <option value="">الكل</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>الجهة</Label>
        <Select name="agency" defaultValue={searchParams.get("agency") || ""}>
          <option value="">الكل</option>
          {agencies.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>المدينة</Label>
        <Select name="city" defaultValue={searchParams.get("city") || ""}>
          <option value="">الكل</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>الحالة</Label>
        <Select name="status" defaultValue={searchParams.get("status") || ""}>
          <option value="">الكل</option>
          <option value="open">مفتوحة</option>
          <option value="ending_soon">تنتهي قريباً</option>
          <option value="closed">منتهية</option>
          <option value="new">جديدة</option>
        </Select>
      </div>
      <div>
        <Label>من تاريخ النشر</Label>
        <Input
          type="date"
          name="publishedFrom"
          defaultValue={searchParams.get("publishedFrom") || ""}
        />
      </div>
      <div>
        <Label>إلى تاريخ النشر</Label>
        <Input
          type="date"
          name="publishedTo"
          defaultValue={searchParams.get("publishedTo") || ""}
        />
      </div>
      <div>
        <Label>آخر موعد من</Label>
        <Input
          type="date"
          name="deadlineFrom"
          defaultValue={searchParams.get("deadlineFrom") || ""}
        />
      </div>
      <div>
        <Label>آخر موعد إلى</Label>
        <Input
          type="date"
          name="deadlineTo"
          defaultValue={searchParams.get("deadlineTo") || ""}
        />
      </div>
      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
        <Button type="submit" className="w-full">
          تطبيق الفلاتر
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push("/tenders")}
        >
          مسح
        </Button>
      </div>
    </form>
  );
}
