import ExcelJS from "exceljs";
import type { Company } from "@/lib/db/schema";

export const GENERATED_EXCEL_TEMPLATES = {
  purchase_request: "طلب شراء",
  rfq: "طلب عرض سعر",
  quote_comparison: "مقارنة عروض الأسعار",
  payment_request: "طلب دفعة",
  supplier_evaluation: "تقييم مورد",
  receiving_minutes: "محضر استلام",
  process_closure: "إغلاق العملية",
} as const;

export type GeneratedExcelTemplateCode =
  keyof typeof GENERATED_EXCEL_TEMPLATES;

const NAVY = "071426";
const GOLD = "D4A017";
const LIGHT_GOLD = "FFF7DD";
const LIGHT_BLUE = "EEF4FB";
const BORDER = "CBD5E1";
const MUTED = "64748B";
const WHITE = "FFFFFF";

export function isGeneratedExcelTemplate(
  value: unknown,
): value is GeneratedExcelTemplateCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(GENERATED_EXCEL_TEMPLATES, value)
  );
}

export async function generateTemplateWorkbook(
  code: GeneratedExcelTemplateCode,
  company: Company,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TenderOne";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const sheet = workbook.addWorksheet(GENERATED_EXCEL_TEMPLATES[code], {
    views: [{ rightToLeft: true, showGridLines: false }],
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.35,
        bottom: 0.35,
        header: 0.15,
        footer: 0.15,
      },
    },
  });

  sheet.columns = [
    { key: "a", width: 18 },
    { key: "b", width: 18 },
    { key: "c", width: 18 },
    { key: "d", width: 18 },
    { key: "e", width: 18 },
    { key: "f", width: 18 },
    { key: "g", width: 18 },
    { key: "h", width: 18 },
  ];

  await addHeader(workbook, sheet, GENERATED_EXCEL_TEMPLATES[code], company);
  const lastRow = BUILDERS[code](sheet, company);
  addFooter(sheet, lastRow + 2, company);
  sheet.pageSetup.printArea = `A1:H${lastRow + 5}`;
  sheet.headerFooter.oddFooter =
    `&R${company.nameAr}&Cصفحة &P من &N&LTenderOne`;

  return workbook;
}

async function addHeader(
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  title: string,
  company: Company,
) {
  sheet.mergeCells("A1:H2");
  const titleCell = sheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { name: "Arial", size: 22, bold: true, color: { argb: WHITE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = solid(NAVY);
  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 18;
  await addCompanyLogo(workbook, sheet, company.logoUrl);

  sheet.mergeCells("A3:D3");
  sheet.getCell("A3").value = company.nameAr;
  sheet.mergeCells("E3:H3");
  sheet.getCell("E3").value = company.nameEn || "BUSINESS DOCUMENT";
  for (const ref of ["A3", "E3"]) {
    const cell = sheet.getCell(ref);
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: GOLD } };
    cell.alignment = {
      horizontal: ref === "A3" ? "right" : "left",
      vertical: "middle",
    };
    cell.fill = solid(NAVY);
  }

  addInfoRow(sheet, 5, "السجل التجاري", company.commercialRegister, "الرقم الضريبي", company.taxCard);
  addInfoRow(sheet, 6, "الهاتف", company.phone, "البريد الإلكتروني", company.email);
  addInfoRow(
    sheet,
    7,
    "العنوان",
    [company.address, company.city, company.country].filter(Boolean).join("، "),
    "الموقع الإلكتروني",
    company.website,
  );
  sheet.getRow(8).height = 8;
}

async function addCompanyLogo(
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  logoUrl: string | null,
) {
  if (!logoUrl) return;

  try {
    let base64: string;
    let extension: "png" | "jpeg";
    const dataMatch = logoUrl.match(
      /^data:image\/(png|jpeg|jpg);base64,(.+)$/i,
    );

    if (dataMatch) {
      extension = dataMatch[1].toLowerCase() === "png" ? "png" : "jpeg";
      base64 = logoUrl;
    } else {
      const response = await fetch(logoUrl);
      if (!response.ok) return;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("png") && !contentType.includes("jpeg")) return;
      extension = contentType.includes("png") ? "png" : "jpeg";
      const bytes = Buffer.from(await response.arrayBuffer());
      base64 = `data:${contentType};base64,${bytes.toString("base64")}`;
    }

    const imageId = workbook.addImage({ base64, extension });
    sheet.addImage(imageId, {
      tl: { col: 0.15, row: 0.15 },
      ext: { width: 62, height: 62 },
      editAs: "oneCell",
    });
  } catch {
    // A broken remote logo must not prevent downloading the workbook.
  }
}

function addInfoRow(
  sheet: ExcelJS.Worksheet,
  row: number,
  label1: string,
  value1: string | null | undefined,
  label2: string,
  value2: string | null | undefined,
) {
  sheet.mergeCells(`A${row}:B${row}`);
  sheet.mergeCells(`C${row}:D${row}`);
  sheet.mergeCells(`E${row}:F${row}`);
  sheet.mergeCells(`G${row}:H${row}`);
  labelCell(sheet.getCell(`A${row}`), label1);
  valueCell(sheet.getCell(`C${row}`), value1 || "—", false);
  labelCell(sheet.getCell(`E${row}`), label2);
  valueCell(sheet.getCell(`G${row}`), value2 || "—", false);
}

function section(sheet: ExcelJS.Worksheet, row: number, title: string) {
  sheet.mergeCells(`A${row}:H${row}`);
  const cell = sheet.getCell(`A${row}`);
  cell.value = title;
  cell.font = { name: "Arial", size: 12, bold: true, color: { argb: WHITE } };
  cell.alignment = { horizontal: "right", vertical: "middle" };
  cell.fill = solid(NAVY);
  cell.border = allBorders(GOLD);
  sheet.getRow(row).height = 24;
}

function formPair(
  sheet: ExcelJS.Worksheet,
  row: number,
  label1: string,
  label2: string,
  value1 = "",
  value2 = "",
) {
  sheet.mergeCells(`A${row}:B${row}`);
  sheet.mergeCells(`C${row}:D${row}`);
  sheet.mergeCells(`E${row}:F${row}`);
  sheet.mergeCells(`G${row}:H${row}`);
  labelCell(sheet.getCell(`A${row}`), label1);
  valueCell(sheet.getCell(`C${row}`), value1, true);
  labelCell(sheet.getCell(`E${row}`), label2);
  valueCell(sheet.getCell(`G${row}`), value2, true);
  sheet.getRow(row).height = 23;
}

function tableHeader(
  sheet: ExcelJS.Worksheet,
  row: number,
  headers: string[],
) {
  headers.forEach((header, index) => {
    const cell = sheet.getCell(row, index + 1);
    cell.value = header;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = solid(NAVY);
    cell.border = allBorders(GOLD);
  });
  sheet.getRow(row).height = 28;
}

/**
 * Styled data-entry rows. Rows beyond `visibleCount` are created hidden
 * inside an outline group, so Excel shows a "+" next to the row numbers
 * that reveals extra ready-to-use rows on click.
 */
function itemRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  visibleCount: number,
  hiddenCount = 0,
  columns = 8,
) {
  const endRow = startRow + visibleCount + hiddenCount - 1;
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 1; col <= columns; col++) {
      const cell = sheet.getCell(row, col);
      cell.fill = solid((row - startRow) % 2 === 0 ? WHITE : LIGHT_BLUE);
      cell.border = allBorders(BORDER);
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.font = { name: "Arial", size: 10, color: { argb: NAVY } };
    }
    sheet.getCell(row, 1).value = row - startRow + 1;
    const rowRef = sheet.getRow(row);
    rowRef.height = 25;
    if (row >= startRow + visibleCount) {
      rowRef.outlineLevel = 1;
      rowRef.hidden = true;
    }
  }
  return endRow;
}

function expandHint(sheet: ExcelJS.Worksheet, row: number) {
  sheet.mergeCells(`A${row}:H${row}`);
  const cell = sheet.getCell(`A${row}`);
  cell.value =
    "تحتاج سطوراً إضافية؟ اضغط علامة (+) بجانب أرقام الصفوف لإظهار سطور جاهزة.";
  cell.font = { name: "Arial", size: 9, italic: true, color: { argb: MUTED } };
  cell.alignment = { horizontal: "right", vertical: "middle" };
  sheet.getRow(row).height = 16;
}

function signatureArea(
  sheet: ExcelJS.Worksheet,
  row: number,
  labels: string[],
) {
  const width = Math.floor(8 / labels.length);
  labels.forEach((label, index) => {
    const start = index * width + 1;
    const end = index === labels.length - 1 ? 8 : start + width - 1;
    sheet.mergeCells(row, start, row, end);
    const labelRef = sheet.getCell(row, start);
    labelRef.value = label;
    labelCell(labelRef, label);
    sheet.mergeCells(row + 1, start, row + 3, end);
    const input = sheet.getCell(row + 1, start);
    input.value = "الاسم / التوقيع / التاريخ";
    valueCell(input, "الاسم / التوقيع / التاريخ", true);
    input.alignment = { horizontal: "center", vertical: "middle" };
  });
}

const BUILDERS: Record<
  GeneratedExcelTemplateCode,
  (sheet: ExcelJS.Worksheet, company: Company) => number
> = {
  purchase_request(sheet) {
    section(sheet, 9, "بيانات طلب الشراء");
    formPair(sheet, 10, "رقم الطلب", "تاريخ الطلب");
    formPair(sheet, 11, "الإدارة الطالبة", "مقدم الطلب");
    formPair(sheet, 12, "تاريخ الاحتياج", "مركز التكلفة");
    section(sheet, 14, "تفاصيل الأصناف والخدمات");
    tableHeader(sheet, 15, [
      "م",
      "الصنف / الخدمة",
      "المواصفات",
      "الكمية",
      "الوحدة",
      "تاريخ التوريد",
      "التكلفة التقديرية",
      "ملاحظات",
    ]);
    itemRows(sheet, 16, 8, 10);
    expandHint(sheet, 34);
    section(sheet, 35, "مبررات الشراء");
    sheet.mergeCells("A36:H38");
    valueCell(sheet.getCell("A36"), "اكتب مبررات وأولوية الشراء هنا", true);
    signatureArea(sheet, 40, ["مقدم الطلب", "مدير الإدارة", "المالية", "الاعتماد"]);
    return 43;
  },

  rfq(sheet) {
    section(sheet, 9, "بيانات طلب عرض السعر");
    formPair(sheet, 10, "رقم الطلب", "تاريخ الإصدار");
    formPair(sheet, 11, "آخر موعد لاستلام العرض", "مدة سريان العرض", "", "30 يوماً");
    formPair(sheet, 12, "اسم المورد", "البريد / الهاتف");
    section(sheet, 14, "الأصناف والخدمات المطلوبة");
    tableHeader(sheet, 15, [
      "م",
      "الوصف",
      "المواصفات",
      "الكمية",
      "الوحدة",
      "سعر الوحدة",
      "الإجمالي",
      "ملاحظات",
    ]);
    itemRows(sheet, 16, 8, 10);
    for (let row = 16; row <= 33; row++) {
      sheet.getCell(`G${row}`).value = { formula: `D${row}*F${row}` };
      sheet.getCell(`F${row}`).numFmt = '"$"#,##0.00';
      sheet.getCell(`G${row}`).numFmt = '"$"#,##0.00';
    }
    sheet.mergeCells("A34:F34");
    labelCell(sheet.getCell("A34"), "الإجمالي قبل الضريبة");
    sheet.mergeCells("G34:H34");
    sheet.getCell("G34").value = { formula: "SUM(G16:G33)" };
    valueCell(sheet.getCell("G34"), "", false);
    sheet.getCell("G34").numFmt = '"$"#,##0.00';
    expandHint(sheet, 35);
    section(sheet, 36, "الشروط التجارية");
    formPair(sheet, 37, "مدة التوريد", "شروط الدفع");
    formPair(sheet, 38, "الضمان", "مكان التسليم");
    sheet.mergeCells("A39:H41");
    valueCell(sheet.getCell("A39"), "شروط وملاحظات إضافية", true);
    signatureArea(sheet, 43, ["إعداد", "مراجعة", "اعتماد"]);
    return 46;
  },

  quote_comparison(sheet) {
    section(sheet, 9, "بيانات المقارنة");
    formPair(sheet, 10, "مرجع طلب العرض", "تاريخ المقارنة");
    formPair(sheet, 11, "المشروع / الإدارة", "أعد المقارنة");
    section(sheet, 13, "مقارنة الأسعار");
    tableHeader(sheet, 14, [
      "م",
      "الصنف",
      "الكمية",
      "المورد الأول",
      "المورد الثاني",
      "المورد الثالث",
      "أفضل سعر",
      "المورد المختار",
    ]);
    itemRows(sheet, 15, 10, 10);
    for (let row = 15; row <= 34; row++) {
      sheet.getCell(`G${row}`).value = { formula: `MIN(D${row}:F${row})` };
      for (const col of ["D", "E", "F", "G"]) {
        sheet.getCell(`${col}${row}`).numFmt = '"$"#,##0.00';
      }
    }
    expandHint(sheet, 35);
    section(sheet, 36, "التقييم غير المالي");
    tableHeader(sheet, 37, [
      "المعيار",
      "الوزن",
      "المورد الأول",
      "المورد الثاني",
      "المورد الثالث",
      "الملاحظات",
      "التوصية",
      "القرار",
    ]);
    itemRows(sheet, 38, 5, 5);
    sheet.mergeCells("A49:H51");
    valueCell(sheet.getCell("A49"), "التوصية النهائية وأسباب الاختيار", true);
    signatureArea(sheet, 53, ["المشتريات", "المالية", "الإدارة الطالبة", "الاعتماد"]);
    return 56;
  },

  payment_request(sheet) {
    section(sheet, 9, "بيانات طلب الدفعة");
    formPair(sheet, 10, "رقم الطلب", "تاريخ الطلب");
    formPair(sheet, 11, "اسم المستفيد", "رقم المورد");
    formPair(sheet, 12, "رقم العقد / أمر الشراء", "رقم الفاتورة");
    formPair(sheet, 13, "قيمة الدفعة", "العملة", "", "USD");
    formPair(sheet, 14, "نسبة الإنجاز", "تاريخ الاستحقاق");
    section(sheet, 16, "البيانات البنكية");
    formPair(sheet, 17, "اسم البنك", "اسم صاحب الحساب");
    formPair(sheet, 18, "رقم الآيبان", "مرجع التحويل");
    section(sheet, 20, "تفاصيل ومبررات الدفعة");
    sheet.mergeCells("A21:H24");
    valueCell(sheet.getCell("A21"), "اكتب تفاصيل الأعمال المنجزة والمرفقات المؤيدة", true);
    section(sheet, 26, "قائمة المرفقات");
    tableHeader(sheet, 27, [
      "م",
      "المرفق",
      "الرقم",
      "التاريخ",
      "القيمة",
      "مرفق؟",
      "مراجعة",
      "ملاحظات",
    ]);
    itemRows(sheet, 28, 5, 5);
    expandHint(sheet, 38);
    signatureArea(sheet, 40, ["مقدم الطلب", "مدير المشروع", "المالية", "الاعتماد"]);
    return 43;
  },

  supplier_evaluation(sheet) {
    section(sheet, 9, "بيانات المورد");
    formPair(sheet, 10, "اسم المورد", "رقم المورد");
    formPair(sheet, 11, "العقد / أمر الشراء", "فترة التقييم");
    formPair(sheet, 12, "المشروع", "المقيّم");
    section(sheet, 14, "معايير التقييم");
    tableHeader(sheet, 15, [
      "م",
      "المعيار",
      "الوزن %",
      "الدرجة من 5",
      "الدرجة المرجحة",
      "نقاط القوة",
      "فرص التحسين",
      "ملاحظات",
    ]);
    const criteria = [
      "جودة المنتجات / الخدمات",
      "الالتزام بمواعيد التسليم",
      "الاستجابة والتواصل",
      "الالتزام بالأسعار والشروط",
      "السلامة والامتثال",
      "خدمة ما بعد البيع",
    ];
    itemRows(sheet, 16, criteria.length, 4);
    criteria.forEach((criterion, index) => {
      sheet.getCell(`B${16 + index}`).value = criterion;
    });
    for (let row = 16; row <= 25; row++) {
      sheet.getCell(`E${row}`).value = { formula: `C${row}*D${row}/5` };
    }
    sheet.mergeCells("A26:D26");
    labelCell(sheet.getCell("A26"), "النتيجة الإجمالية");
    sheet.mergeCells("E26:H26");
    sheet.getCell("E26").value = { formula: "SUM(E16:E25)" };
    valueCell(sheet.getCell("E26"), "", false);
    expandHint(sheet, 27);
    section(sheet, 28, "قرار الاستمرار مع المورد");
    formPair(sheet, 29, "التصنيف", "التوصية");
    sheet.mergeCells("A30:H32");
    valueCell(sheet.getCell("A30"), "ملاحظات وخطة الإجراءات التصحيحية", true);
    signatureArea(sheet, 34, ["المقيّم", "مدير الإدارة", "المشتريات"]);
    return 37;
  },

  receiving_minutes(sheet) {
    section(sheet, 9, "بيانات محضر الاستلام");
    formPair(sheet, 10, "رقم المحضر", "تاريخ الاستلام");
    formPair(sheet, 11, "أمر الشراء / العقد", "اسم المورد");
    formPair(sheet, 12, "مكان الاستلام", "رقم إشعار التسليم");
    section(sheet, 14, "الأصناف المستلمة");
    tableHeader(sheet, 15, [
      "م",
      "الصنف / الخدمة",
      "الكمية المطلوبة",
      "الكمية المستلمة",
      "الحالة",
      "مطابق؟",
      "النقص / التلف",
      "ملاحظات",
    ]);
    itemRows(sheet, 16, 8, 10);
    expandHint(sheet, 34);
    section(sheet, 35, "قرار لجنة الاستلام");
    formPair(sheet, 36, "القرار", "تاريخ الإغلاق");
    sheet.mergeCells("A37:H39");
    valueCell(sheet.getCell("A37"), "ملاحظات اللجنة والإجراءات المطلوبة", true);
    signatureArea(sheet, 41, ["عضو اللجنة", "عضو اللجنة", "رئيس اللجنة", "ممثل المورد"]);
    return 44;
  },

  process_closure(sheet) {
    section(sheet, 9, "بيانات إغلاق العملية");
    formPair(sheet, 10, "رقم العملية", "تاريخ الإغلاق");
    formPair(sheet, 11, "المشروع / العقد", "المورد / المنفذ");
    formPair(sheet, 12, "تاريخ البدء", "تاريخ الانتهاء");
    formPair(sheet, 13, "القيمة التعاقدية", "القيمة النهائية");
    section(sheet, 15, "المخرجات والالتزامات");
    tableHeader(sheet, 16, [
      "م",
      "المخرج / الالتزام",
      "المسؤول",
      "الموعد",
      "الحالة",
      "تم الاستلام؟",
      "المرجع",
      "ملاحظات",
    ]);
    itemRows(sheet, 17, 7, 8);
    expandHint(sheet, 32);
    section(sheet, 33, "التسوية المالية");
    formPair(sheet, 34, "إجمالي المدفوع", "المبلغ المتبقي");
    formPair(sheet, 35, "الغرامات / الخصومات", "حالة الضمانات");
    section(sheet, 37, "الدروس المستفادة والتوصيات");
    sheet.mergeCells("A38:H41");
    valueCell(sheet.getCell("A38"), "دوّن الدروس المستفادة والتوصيات للعمليات القادمة", true);
    signatureArea(sheet, 43, ["مدير العملية", "المالية", "الإدارة المستفيدة", "الاعتماد"]);
    return 46;
  },
};

function addFooter(sheet: ExcelJS.Worksheet, row: number, company: Company) {
  sheet.mergeCells(`A${row}:H${row}`);
  const cell = sheet.getCell(`A${row}`);
  cell.value = `${company.nameAr} — مستند مولّد عبر TenderOne`;
  cell.font = { name: "Arial", size: 9, italic: true, color: { argb: MUTED } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = { top: { style: "thin", color: { argb: GOLD } } };
}

function labelCell(cell: ExcelJS.Cell, value: string) {
  cell.value = value;
  cell.font = { name: "Arial", size: 10, bold: true, color: { argb: NAVY } };
  cell.fill = solid(LIGHT_GOLD);
  cell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
  cell.border = allBorders(BORDER);
}

function valueCell(
  cell: ExcelJS.Cell,
  value: string,
  editable: boolean,
) {
  if (value) cell.value = value;
  cell.font = {
    name: "Arial",
    size: 10,
    color: { argb: editable ? NAVY : MUTED },
    italic: editable && Boolean(value),
  };
  cell.fill = solid(editable ? LIGHT_BLUE : WHITE);
  cell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
  cell.border = allBorders(BORDER);
}

function solid(color: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: color } };
}

function allBorders(color: string): Partial<ExcelJS.Borders> {
  const border: ExcelJS.Border = {
    style: "thin",
    color: { argb: color },
  };
  return { top: border, left: border, bottom: border, right: border };
}
