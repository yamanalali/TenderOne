import { get } from "@vercel/blob";
import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppSettings, getGlobalOpenAIConfig } from "@/lib/settings";

export const maxDuration = 300;

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
  let bytes: Uint8Array | null = null;

  try {
    const result = await get(input.pathname, { access: "private" });
    if (result?.statusCode === 200 && result.stream) {
      const arrayBuffer = await new Response(result.stream).arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
    }
  } catch {
    // Fall through to URL fetch for public/legacy blobs.
  }

  if (!bytes && input.blobUrl) {
    const response = await fetch(input.blobUrl);
    if (!response.ok) {
      throw new Error("تعذر تنزيل الملف من التخزين السحابي");
    }
    bytes = new Uint8Array(await response.arrayBuffer());
  }

  if (!bytes) {
    throw new Error("تعذر قراءة الملف المرفوع من التخزين السحابي");
  }

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

  try {
    // Preferred path for large files: client uploaded to Blob already.
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

    // Legacy/local path: multipart body (limited to ~4.5MB on Vercel).
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "يرجى اختيار ملف PDF" },
        { status: 400 },
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "الملف يجب أن يكون بصيغة PDF" },
        { status: 400 },
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `حجم الملف «${file.name}» يتجاوز الحد المسموح (${settings.maxUploadMb} MB). قسّم المناقصة إلى عدة ملفات PDF أصغر وارفعها معاً في نفس التحليل.`,
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
