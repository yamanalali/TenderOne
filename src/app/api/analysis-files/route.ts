import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppSettings, getGlobalOpenAIConfig } from "@/lib/settings";

export const maxDuration = 300;

/** Reject multipart bodies that would hit Vercel's ~4.5MB platform limit. */
const MULTIPART_HARD_LIMIT = 3.5 * 1024 * 1024;

async function uploadBytesToOpenAI(
  bytes: Uint8Array,
  fileName: string,
  apiKey: string,
) {
  const client = new OpenAI({ apiKey });
  const file = await toFile(bytes, fileName, { type: "application/pdf" });
  const uploaded = await client.files.create({
    file,
    purpose: "user_data",
  });
  return {
    url: `openai:${uploaded.id}`,
    pathname: uploaded.id,
    fileName,
  };
}

async function ingestFromBlob(input: {
  blobUrl: string;
  fileName: string;
  maxBytes: number;
  apiKey: string;
}) {
  // Public Blob store: download via the public URL (no private get()).
  const response = await fetch(input.blobUrl);
  if (!response.ok) {
    throw new Error(
      "تعذر تنزيل الملف من Vercel Blob. تأكد أن التخزين مربوط بالمشروع وأن BLOB_READ_WRITE_TOKEN موجود بعد Redeploy.",
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength > input.maxBytes) {
    throw new Error(
      `حجم الملف «${input.fileName}» يتجاوز الحد المسموح (${Math.round(input.maxBytes / (1024 * 1024))} MB). قسّم المناقصة إلى عدة ملفات PDF أصغر.`,
    );
  }

  return uploadBytesToOpenAI(bytes, input.fileName, input.apiKey);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [settings, openAI] = await Promise.all([
    getAppSettings(),
    getGlobalOpenAIConfig(),
  ]);
  if (!openAI.apiKey) {
    return NextResponse.json(
      { error: "مفتاح OpenAI غير مضبوط في إعدادات الإدارة" },
      { status: 503 },
    );
  }

  const maxBytes = settings.maxUploadMb * 1024 * 1024;
  const contentType = request.headers.get("content-type") || "";
  const contentLength = Number(request.headers.get("content-length") || 0);

  try {
    // Preferred path: tiny JSON after client uploaded to Blob.
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        blobUrl?: string;
        pathname?: string;
        fileName?: string;
      };
      if (!body.blobUrl || !body.pathname || !body.fileName) {
        return NextResponse.json(
          { error: "بيانات الملف غير مكتملة" },
          { status: 400 },
        );
      }

      const result = await ingestFromBlob({
        blobUrl: body.blobUrl,
        fileName: body.fileName,
        maxBytes,
        apiKey: openAI.apiKey,
      });
      return NextResponse.json(result);
    }

    // Legacy multipart — only for small local/dev uploads.
    if (contentLength > MULTIPART_HARD_LIMIT) {
      return NextResponse.json(
        {
          error:
            "الملف كبير جداً لمسار الرفع المباشر. ارفع عبر Vercel Blob (فعّل Storage → Blob في المشروع).",
        },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "يرجى اختيار ملف PDF" },
        { status: 400 },
      );
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "الملف يجب أن يكون بصيغة PDF" },
        { status: 400 },
      );
    }
    if (file.size > MULTIPART_HARD_LIMIT) {
      return NextResponse.json(
        {
          error:
            "الملف كبير جداً لمسار الرفع المباشر. فعّل Vercel Blob أو قسّم الملف.",
        },
        { status: 413 },
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `حجم الملف «${file.name}» يتجاوز الحد المسموح (${settings.maxUploadMb} MB).`,
        },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await uploadBytesToOpenAI(bytes, file.name, openAI.apiKey);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر تجهيز الملف للتحليل",
      },
      { status: 502 },
    );
  }
}
