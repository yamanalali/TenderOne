"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 700_000;

export function CompanyLogoField({
  initialValue,
  companyName,
}: {
  initialValue?: string | null;
  companyName: string;
}) {
  const [logoUrl, setLogoUrl] = useState(initialValue || "");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("الشعار يجب أن يكون PNG أو JPG أو WebP");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("حجم الشعار يجب ألا يتجاوز 2 MB");
      return;
    }

    try {
      const dataUrl = await resizeLogo(file, 320);
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        const smaller = await resizeLogo(file, 220);
        if (smaller.length > MAX_DATA_URL_LENGTH) {
          throw new Error("الصورة معقدة جداً؛ استخدم شعاراً أبسط أو أصغر");
        }
        setLogoUrl(smaller);
      } else {
        setLogoUrl(dataUrl);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "تعذر تجهيز الشعار",
      );
    }
  }

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <Label>شعار الشركة</Label>
      <div className="mt-2 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`شعار ${companyName}`}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <ImagePlus className="h-8 w-8 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
          />
          <p className="mt-2 text-xs text-slate-500">
            يفضّل شعار مربع أو أفقي بخلفية شفافة. سيظهر تلقائياً في جميع
            التصاميم وملفات Excel.
          </p>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>
        {logoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-rose-600"
            onClick={() => setLogoUrl("")}
          >
            <Trash2 className="h-4 w-4" />
            إزالة
          </Button>
        )}
      </div>
    </div>
  );
}

function resizeLogo(file: File, maxSize: number) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("تعذر معالجة الصورة"));
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("ملف الصورة غير صالح"));
    };
    image.src = objectUrl;
  });
}
