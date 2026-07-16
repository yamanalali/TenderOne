"use client";

import { useActionState, useState } from "react";
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
}: {
  tenderId?: string;
  credits: number;
}) {
  const router = useRouter();
  const [file, setFile] = useState<{
    url: string;
    pathname: string;
    fileName: string;
  } | null>(null);

  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await createAnalysisAction(prev, formData);
      if (result.success && result.success.length > 20) {
        router.push(`/analyses/${result.success}`);
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

      <form action={formAction} className="mt-6 space-y-4">
        <UploadButton
          label="ملف PDF لدفتر الشروط"
          accept="application/pdf"
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

        <Button type="submit" disabled={pending || !file}>
          {pending ? "جاري بدء التحليل..." : "بدء التحليل"}
        </Button>
      </form>
    </Card>
  );
}
