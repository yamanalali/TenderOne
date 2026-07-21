"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAnalysisPdf } from "@/lib/analysis/upload-client";

type UploadResult = {
  url: string;
  pathname: string;
  fileName: string;
};

export function UploadButton({
  accept = "application/pdf",
  label = "رفع ملف",
  purpose = "general",
  onUploaded,
}: {
  accept?: string;
  label?: string;
  purpose?: "general" | "analysis";
  onUploaded: (result: UploadResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      if (purpose === "analysis") {
        onUploaded(await uploadAnalysisPdf(file));
        return;
      }

      if (!process.env.NEXT_PUBLIC_USE_BLOB || process.env.NEXT_PUBLIC_USE_BLOB === "false") {
        // Local/dev fallback when Blob token is not configured
        const objectUrl = URL.createObjectURL(file);
        onUploaded({
          url: objectUrl,
          pathname: `local/${Date.now()}-${file.name}`,
          fileName: file.name,
        });
        return;
      }

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      onUploaded({
        url: blob.url,
        pathname: blob.pathname,
        fileName: file.name,
      });
    } catch (err) {
      if (purpose === "analysis") {
        setError(err instanceof Error ? err.message : "فشل تجهيز الملف للتحليل");
        setFileName(null);
        event.target.value = "";
        return;
      }

      // Fallback for environments without Blob credentials
      try {
        const objectUrl = URL.createObjectURL(file);
        onUploaded({
          url: objectUrl,
          pathname: `local/${Date.now()}-${file.name}`,
          fileName: file.name,
        });
      } catch {
        setError(err instanceof Error ? err.message : "فشل الرفع");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
        <Input type="file" accept={accept} onChange={handleChange} disabled={loading} />
      </label>
      {loading && <p className="text-sm text-teal-700">جاري الرفع...</p>}
      {fileName && !loading && (
        <p className="text-sm text-slate-600">تم اختيار: {fileName}</p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {loading && (
        <Button type="button" disabled>
          رفع...
        </Button>
      )}
    </div>
  );
}
