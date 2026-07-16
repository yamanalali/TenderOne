import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) {
          throw new Error("Not authenticated");
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
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            companyId: session.companyId,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
