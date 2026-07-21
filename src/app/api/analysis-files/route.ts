import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppSettings, getGlobalOpenAIConfig } from "@/lib/settings";

export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "يرجى اختيار ملف PDF" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "الملف يجب أن يكون بصيغة PDF" },
      { status: 400 },
    );
  }

  const [settings, openAI] = await Promise.all([
    getAppSettings(),
    getGlobalOpenAIConfig(),
  ]);
  if (file.size > settings.maxUploadMb * 1024 * 1024) {
    return NextResponse.json(
      {
        error: `حجم الملف «${file.name}» يتجاوز الحد المسموح (${settings.maxUploadMb} MB). قسّم المناقصة إلى عدة ملفات PDF أصغر وارفعها معاً في نفس التحليل.`,
      },
      { status: 400 },
    );
  }
  if (!openAI.apiKey) {
    return NextResponse.json(
      { error: "مفتاح OpenAI غير مضبوط في إعدادات الإدارة" },
      { status: 503 },
    );
  }

  try {
    const client = new OpenAI({ apiKey: openAI.apiKey });
    const uploaded = await client.files.create({
      file,
      purpose: "user_data",
    });

    return NextResponse.json({
      url: `openai:${uploaded.id}`,
      pathname: uploaded.id,
      fileName: file.name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `تعذر رفع الملف إلى OpenAI: ${error.message}`
            : "تعذر رفع الملف إلى OpenAI",
      },
      { status: 502 },
    );
  }
}
