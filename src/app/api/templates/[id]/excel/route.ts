import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, products } from "@/lib/db/schema";
import { hasTemplateAccess, isSystemAdmin } from "@/lib/permissions";
import {
  generateTemplateWorkbook,
  isGeneratedExcelTemplate,
} from "@/lib/templates/excel";

export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.companyId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.type, "template")))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const allowed =
    isSystemAdmin(session) ||
    (await hasTemplateAccess(session.companyId, product.id));
  if (!allowed) {
    return NextResponse.json(
      { error: "يجب شراء النموذج وتفعيله أولاً" },
      { status: 403 },
    );
  }

  const metadata = product.metadata as { templateCode?: unknown } | null;
  if (!isGeneratedExcelTemplate(metadata?.templateCode)) {
    return NextResponse.json(
      { error: "هذا المنتج لا يدعم التوليد بصيغة Excel" },
      { status: 400 },
    );
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);
  if (!company) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
  }

  const workbook = await generateTemplateWorkbook(
    metadata.templateCode,
    company,
  );
  const buffer = await workbook.xlsx.writeBuffer();
  const safeName = product.nameAr.replace(/[\\/:*?"<>|]/g, "-");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        `${safeName}.xlsx`,
      )}`,
      "Cache-Control": "private, no-store",
    },
  });
}
