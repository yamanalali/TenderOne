"use client";

import { put } from "@vercel/blob/client";

export type AnalysisUploadResult = {
  url: string;
  pathname: string;
  fileName: string;
};

/** Vercel serverless request body limit is ~4.5MB. Stay safely under it. */
const SERVERLESS_SAFE_BYTES = 3.5 * 1024 * 1024;

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
      /request entity too large|FUNCTION_PAYLOAD_TOO_LARGE/i.test(text) ||
      text.trimStart().startsWith("Request Entity")
    ) {
      throw new Error(
        "الملف كبير جداً لرفعه عبر دالة Vercel. يجب تفعيل Vercel Blob من Storage في المشروع ثم إعادة النشر.",
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
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobUrl: input.blobUrl,
      pathname: input.pathname,
      fileName: input.fileName,
    }),
  });
  return parseResponse(response);
}

/**
 * Request a Blob client token ourselves so we can surface the server's
 * Arabic error instead of the opaque SDK message.
 */
async function requestBlobClientToken(
  pathname: string,
  multipart: boolean,
): Promise<string> {
  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: {
        pathname,
        clientPayload: null,
        multipart,
      },
    }),
  });

  const text = await response.text();
  let json: { clientToken?: string; error?: string } | null = null;
  try {
    json = JSON.parse(text) as { clientToken?: string; error?: string };
  } catch {
    json = null;
  }

  if (!response.ok || !json?.clientToken) {
    throw new Error(
      json?.error ||
        (response.status === 503
          ? "BLOB_READ_WRITE_TOKEN غير موجود. من Vercel: Storage → اربط tender-one-blob بمشروع TenderOne ثم Redeploy."
          : response.status === 401
            ? "انتهت جلستك. سجّل الدخول ثم أعد المحاولة."
            : `فشل الحصول على إذن الرفع من الخادم (رمز ${response.status}). تأكد أن Blob مربوط بالمشروع وأنك أعدت النشر بعد الربط.`),
    );
  }

  return json.clientToken;
}

async function uploadViaBlob(file: File): Promise<AnalysisUploadResult> {
  const pathname = `analysis/${Date.now()}-${file.name}`;
  const multipart = true;

  try {
    const token = await requestBlobClientToken(pathname, multipart);
    // Must match the Blob store type (tender-one-blob is Private).
    const blob = await put(pathname, file, {
      access: "private",
      token,
      multipart,
      contentType: "application/pdf",
    });

    return await registerBlobWithOpenAI({
      blobUrl: blob.url,
      pathname: blob.pathname,
      fileName: file.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      /BLOB_READ_WRITE_TOKEN|No token|token|not configured|Unauthorized|Forbidden|Failed to retrieve the client token/i.test(
        message,
      ) &&
      !message.includes("BLOB_READ_WRITE_TOKEN غير موجود") &&
      !message.includes("فشل الحصول على إذن")
    ) {
      throw new Error(
        "تخزين Vercel Blob غير جاهز. من لوحة Vercel: Storage → Projects → اربط tender-one-blob بمشروع TenderOne، تأكد من وجود BLOB_READ_WRITE_TOKEN، ثم Redeploy.",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("فشل رفع الملف عبر التخزين السحابي");
  }
}

async function uploadViaMultipart(file: File): Promise<AnalysisUploadResult> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/analysis-files", {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  return parseResponse(response);
}

/**
 * Large PDFs cannot pass through Vercel serverless request bodies (~4.5MB).
 * On Vercel / for large files we ONLY use Blob direct upload, then a tiny
 * JSON call to register the blob with OpenAI.
 */
export async function uploadAnalysisPdf(
  file: File,
): Promise<AnalysisUploadResult> {
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error(`الملف «${file.name}» ليس بصيغة PDF`);
  }

  const onVercel =
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith(".vercel.app") ||
      Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV));

  const mustUseBlob =
    onVercel ||
    file.size > SERVERLESS_SAFE_BYTES ||
    process.env.NEXT_PUBLIC_USE_BLOB === "true";

  if (mustUseBlob) {
    return uploadViaBlob(file);
  }

  try {
    return await uploadViaBlob(file);
  } catch {
    return uploadViaMultipart(file);
  }
}
