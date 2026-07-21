import ExcelJS from "exceljs";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { SECTION_LABELS } from "@/lib/analysis/types";
import { db } from "@/lib/db";
import { analyses, checklistItems } from "@/lib/db/schema";
import { assertCompanyAccess } from "@/lib/permissions";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, id))
    .limit(1);

  if (!analysis) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  try {
    assertCompanyAccess(session, analysis.companyId);
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.analysisId, id))
    .orderBy(asc(checklistItems.sortOrder));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TenderOne";
  const sheet = workbook.addWorksheet("قائمة المطلوبات", {
    views: [{ rightToLeft: true }],
  });

  sheet.columns = [
    { header: "م", key: "n", width: 6 },
    { header: "القسم", key: "section", width: 22 },
    { header: "البند", key: "title", width: 36 },
    { header: "التفاصيل", key: "details", width: 42 },
    { header: "الصفحة", key: "page", width: 10 },
    { header: "مطلوب؟", key: "required", width: 12 },
    { header: "مكتمل؟", key: "done", width: 12 },
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF071426" },
  };
  header.alignment = { horizontal: "center", vertical: "middle" };

  items.forEach((item, index) => {
    sheet.addRow({
      n: index + 1,
      section: SECTION_LABELS[item.section] || item.section,
      title: item.title,
      details: item.details || "",
      page: item.pageNumber ?? "",
      required: item.isRequired ? "نعم" : "لا",
      done: item.isCompleted ? "نعم" : "لا",
    });
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.alignment = { vertical: "middle", wrapText: true };
    row.height = 22;
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const safeName = analysis.fileName.replace(/[^\w\u0600-\u06FF.-]+/g, "_");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="checklist-${safeName}.xlsx"`,
    },
  });
}
