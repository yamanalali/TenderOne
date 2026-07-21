import { after } from "next/server";
import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";

export const maxDuration = 300;

function processUrl(analysisId: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  return `${base.replace(/\/$/, "")}/api/analyses/${analysisId}/process`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== (process.env.AUTH_SECRET || "dev-secret")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const result = await runAnalysisPipeline(id);

    // Long PDFs: chain another invocation after this batch finishes.
    if (result.continued) {
      after(async () => {
        try {
          await fetch(processUrl(id), {
            method: "POST",
            headers: {
              "x-internal-secret": process.env.AUTH_SECRET || "dev-secret",
            },
            cache: "no-store",
          });
        } catch (error) {
          console.error("Failed to continue analysis batch", id, error);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      continued: result.continued,
      progress: result.progress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
