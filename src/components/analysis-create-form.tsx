"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAnalysisAction } from "@/app/actions/analyses";
import type { ActionState } from "@/app/actions/auth";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AnalysisCreateForm({
  tenderId,
  credits,
  paymentsHref = "/payments",
}: {
  tenderId?: string;
  credits: number;
  paymentsHref?: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);

  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      if (credits <= 0) {
        return {
          error:
            "لا يوجد رصيد تحليل متاح. اشترِ خدمة التحليل من صفحة الدفع ثم أعد المحاولة.",
        };
      }
      if (
        !confirm(
          "سيُستهلك رصيد تحليل واحد عند بدء هذه العملية. هل تريد المتابعة؟",
        )
      ) {
        return prev;
      }
      const result = await createAnalysisAction(prev, formData);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
      return result;
    },
    {},
  );

  return (
    <Card>
      <CardTitle>رفع دفتر الشروط</CardTitle>
      <CardDescription>
        خدمة مستقلة تماماً — يمكنك التحليل حتى لو لم تكن المناقصة منشورة داخل
        المنصة. رصيدك الحالي: {credits}
      </CardDescription>

      {credits <= 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">رصيدك منتهٍ حالياً</p>
          <p className="mt-1">
            فعّل رصيد تحليل من صفحة المدفوعات قبل رفع ملف جديد.
          </p>
          <Link
            href={paymentsHref}
            className="mt-3 inline-block font-bold text-amber-800 underline"
          >
            الذهاب للمدفوعات
          </Link>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <UploadButton
          label="ملف PDF لدفتر الشروط"
          accept="application/pdf"
          purpose="analysis"
          onUploaded={setFile}
        />
        <input type="hidden" name="fileUrl" value={file?.url || ""} />
        <input type="hidden" name="filePathname" value={file?.pathname || ""} />
        <input type="hidden" name="fileName" value={file?.fileName || ""} />
        <input type="hidden" name="tenderId" value={tenderId || ""} />

        {tenderId && (
          <div>
            <Label>مرتبط بمناقصة (اختياري)</Label>
            <Input value={tenderId} disabled />
          </div>
        )}

        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending || !file || credits <= 0}>
          {pending ? "جاري بدء التحليل..." : "بدء التحليل"}
        </Button>
      </form>
    </Card>
  );
}
