"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Upload } from "lucide-react";
import { createAnalysisAction } from "@/app/actions/analyses";
import type { ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadedFile = {
  url: string;
  pathname: string;
  fileName: string;
};

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  async function uploadSelected(selected: FileList | null) {
    if (!selected?.length) return;
    setUploading(true);
    setUploadError(null);

    try {
      const next: UploadedFile[] = [];
      for (const file of Array.from(selected)) {
        if (file.type !== "application/pdf") {
          throw new Error(`الملف «${file.name}» ليس بصيغة PDF`);
        }
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/analysis-files", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as UploadedFile & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error || `فشل رفع ${file.name}`);
        }
        next.push(result);
      }
      setFiles((prev) => [...prev, ...next]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "فشل رفع الملفات",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardTitle>رفع ملفات المناقصة</CardTitle>
      <CardDescription>
        ارفع كل ملفات المناقصة المرتبطة (PDF) في طلب واحد للحصول على قائمة
        متطلبات شاملة. رصيدك الحالي: {credits}
      </CardDescription>

      {credits <= 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">رصيدك منتهٍ حالياً</p>
          <p className="mt-1">
            فعّل رصيد تحليل من صفحة المدفوعات قبل رفع ملفات جديدة.
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
        <div>
          <Label>ملفات PDF المرتبطة بالمناقصة</Label>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-amber-300 hover:bg-amber-50/40">
            <Upload className="h-6 w-6 text-amber-700" />
            <p className="mt-3 text-sm font-bold text-slate-700">
              اختر ملفًا أو أكثر
            </p>
            <p className="mt-1 text-xs text-slate-500">
              يمكن رفع عدة ملفات PDF في نفس التحليل
            </p>
            <Input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="mt-4 max-w-xs"
              disabled={uploading || credits <= 0}
              onChange={(event) => uploadSelected(event.target.files)}
            />
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.pathname}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-amber-700" />
                  <span className="truncate text-sm font-semibold text-slate-700">
                    {file.fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="حذف الملف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="hidden"
          name="filesJson"
          value={JSON.stringify(
            files.map((file) => ({
              fileName: file.fileName,
              fileUrl: file.url,
              filePathname: file.pathname,
            })),
          )}
        />
        <input type="hidden" name="tenderId" value={tenderId || ""} />

        {tenderId && (
          <div>
            <Label>مرتبط بمناقصة (اختياري)</Label>
            <Input value={tenderId} disabled />
          </div>
        )}

        {uploading && (
          <p className="text-sm text-teal-700">جاري رفع الملفات وتجهيزها...</p>
        )}
        {uploadError && <p className="text-sm text-rose-600">{uploadError}</p>}
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button
          type="submit"
          disabled={pending || uploading || files.length === 0 || credits <= 0}
        >
          {pending
            ? "جاري بدء التحليل..."
            : files.length > 1
              ? `بدء تحليل ${files.length} ملفات`
              : "بدء التحليل"}
        </Button>
      </form>
    </Card>
  );
}
