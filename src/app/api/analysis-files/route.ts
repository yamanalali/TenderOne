import { get } from "@vercel/blob";
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
  pathname: string;
  blobUrl?: string;
  fileName: string;
  maxBytes: number;
  apiKey: string;
}) {
  // Private Blob store: authenticated download via SDK.
  const result = await get(input.pathname, { access: "private" });
  if (!result?.stream) {
    throw new Error(
      "تعذر قراءة الملف من Vercel Blob الخاص. تأكد أن التخزين مربوط بالمشروع وأنك أعدت النشر بعد إنشاء المخزن.",
    );
  }

  const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer());

  if (bytes.byteLength > input.maxBytes) {
    throw new Error(
      `حجم الملف «${input.fileName}» يتجاوز الحد المسموح (${Math.round(input.maxBytes / (1024 * 1024))} MB). قسّم المناقصة إلى عدة ملفات PDF أصغر.`,
    );
  }

  const openai = await uploadBytesToOpenAI(
    bytes,
    input.fileName,
    input.apiKey,
  );

  // Keep Blob pathname so large-PDF splitting can re-download later.
  // OpenAI forbids downloading files with purpose user_data.
  return {
    url: openai.url,
    pathname: input.pathname,
    fileName: input.fileName,
  };
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
      if (!body.pathname || !body.fileName) {
        return NextResponse.json(
          { error: "بيانات الملف غير مكتملة" },
          { status: 400 },
        );
      }

      const result = await ingestFromBlob({
        pathname: body.pathname,
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
