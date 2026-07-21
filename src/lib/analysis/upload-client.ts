"use client";

import { upload } from "@vercel/blob/client";

export type AnalysisUploadResult = {
  url: string;
  pathname: string;
  fileName: string;
};

async function parseResponse(
  response: Response,
): Promise<AnalysisUploadResult> {
  const text = await response.text();
  let json: (AnalysisUploadResult & { error?: string }) | null = null;
  try {
    json = JSON.parse(text) as AnalysisUploadResult & { error?: string };
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (
      response.status === 413 ||
      /request entity too large/i.test(text) ||
      text.trimStart().startsWith("Request Entity")
    ) {
      throw new Error(
        "الملف كبير جداً لرفعه مباشرة عبر السيرفر. فعّل Vercel Blob أو قسّم الـ PDF إلى ملفات أصغر من 4MB وارفعها معاً.",
      );
    }
    throw new Error(
      json?.error || text.trim() || `فشل الرفع (رمز ${response.status})`,
    );
  }

  if (!json?.url || !json.pathname) {
    throw new Error("استجابة غير صالحة من خادم الرفع");
  }
  return {
    url: json.url,
    pathname: json.pathname,
    fileName: json.fileName,
  };
}

async function registerBlobWithOpenAI(input: {
  blobUrl: string;
  pathname: string;
  fileName: string;
}): Promise<AnalysisUploadResult> {
  const response = await fetch("/api/analysis-files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse(response);
}

async function uploadViaMultipart(file: File): Promise<AnalysisUploadResult> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/analysis-files", {
    method: "POST",
    body,
  });
  return parseResponse(response);
}

/**
 * Large PDFs cannot pass through Vercel serverless request bodies (~4.5MB).
 * Prefer Blob direct upload, then register the blob with OpenAI on the server.
 */
export async function uploadAnalysisPdf(
  file: File,
): Promise<AnalysisUploadResult> {
  if (file.type !== "application/pdf") {
    throw new Error(`الملف «${file.name}» ليس بصيغة PDF`);
  }

  const blobDisabled = process.env.NEXT_PUBLIC_USE_BLOB === "false";
  const tooLargeForServerless = file.size > 4 * 1024 * 1024;

  if (!blobDisabled) {
    try {
      const blob = await upload(`analysis/${Date.now()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
        multipart: true,
      });
      return await registerBlobWithOpenAI({
        blobUrl: blob.url,
        pathname: blob.pathname,
        fileName: file.name,
      });
    } catch (error) {
      if (tooLargeForServerless) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "فشل رفع الملف الكبير. تأكد من تفعيل Vercel Blob على السيرفر، أو قسّم الملف إلى أجزاء أصغر.",
        );
      }
      // Small files can still use the legacy multipart path locally.
    }
  } else if (tooLargeForServerless) {
    throw new Error(
      "الملف أكبر من 4.5MB. فعّل Vercel Blob أو قسّم الـ PDF إلى عدة ملفات أصغر.",
    );
  }

  return uploadViaMultipart(file);
}
