import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return NextResponse.json({
    configured,
    message: configured
      ? "Vercel Blob جاهز"
      : "BLOB_READ_WRITE_TOKEN غير موجود. اربط Blob Store بالمشروع ثم أعد النشر.",
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN غير موجود. من Vercel: Storage → Projects → اربط tender-one-blob بمشروع TenderOne ثم Redeploy.",
      },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { error: "طلب غير صالح لتوليد إذن الرفع" },
      { status: 400 },
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) {
          throw new Error("UNAUTHORIZED");
        }

        const settings = await getAppSettings();
        const maxBytes = settings.maxUploadMb * 1024 * 1024;

        return {
          allowedContentTypes: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
          ],
          maximumSizeInBytes: maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            companyId: session.companyId,
          }),
        };
      },
      // Keep optional; token generation must not depend on callback reachability.
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "UNAUTHORIZED" || /Not authenticated/i.test(message)) {
      return NextResponse.json(
        { error: "انتهت جلستك. سجّل الدخول ثم أعد المحاولة." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        error:
          message.includes("BLOB_READ_WRITE_TOKEN") ||
          message.includes("No token")
            ? "BLOB_READ_WRITE_TOKEN غير صالح أو غير مربوط بالمشروع. أعد ربط Blob ثم Redeploy."
            : message,
      },
      { status: 400 },
    );
  }
}
