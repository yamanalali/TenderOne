import { NextResponse } from "next/server";
import { analyzeTenderDocumentWorkflow } from "@/workflows/analyze-tender-document";

export const maxDuration = 300;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== (process.env.AUTH_SECRET || "dev-secret")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  // Do not await the whole pipeline in the response path when possible.
  // For reliability in this app we await within maxDuration.
  try {
    await analyzeTenderDocumentWorkflow(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
