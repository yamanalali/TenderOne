"use client";

import { useActionState, useState } from "react";
import { createPaymentOrderAction } from "@/app/actions/payments";
import type { ActionState } from "@/app/actions/auth";
import type { Product } from "@/lib/db/schema";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function PaymentForm({
  products,
  bankName,
  bankAccountName,
  bankIban,
}: {
  products: Product[];
  bankName: string;
  bankAccountName: string;
  bankIban: string;
}) {
  const [receipt, setReceipt] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);

  const [state, formAction, pending] = useActionState(
    createPaymentOrderAction,
    {} as ActionState,
  );

  return (
    <Card>
      <CardTitle>طلب تفعيل خدمة / منتج</CardTitle>
      <CardDescription>
        حوّل إلى الحساب البنكي ثم ارفع إشعار التحويل لمراجعة الإدارة
      </CardDescription>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>البنك: {bankName}</p>
        <p>اسم الحساب: {bankAccountName}</p>
        <p>IBAN: {bankIban}</p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label>الخدمة أو المنتج</Label>
          <Select name="productId" required defaultValue="">
            <option value="" disabled>
              اختر...
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameAr} — {p.price} {p.currency}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>مرجع التحويل</Label>
          <Input name="transferReference" required />
        </div>
        <div>
          <Label>ملاحظة</Label>
          <Textarea name="transferNote" />
        </div>
        <UploadButton
          label="إشعار التحويل (صورة أو PDF)"
          accept="image/*,application/pdf"
          onUploaded={setReceipt}
        />
        <input type="hidden" name="receiptUrl" value={receipt?.url || ""} />
        <input
          type="hidden"
          name="receiptPathname"
          value={receipt?.pathname || ""}
        />
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-teal-700">{state.success}</p>
        )}
        <Button type="submit" disabled={pending || !receipt}>
          {pending ? "جاري الإرسال..." : "إرسال للمراجعة"}
        </Button>
      </form>
    </Card>
  );
}
