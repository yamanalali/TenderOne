import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";

type CatalogProduct = {
  type:
    | "analysis_credit"
    | "company_profile"
    | "template"
    | "service"
    | "bundle";
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  price: string;
  credits?: number;
  metadata: Record<string, unknown>;
};

const CATALOG: CatalogProduct[] = [
  {
    type: "analysis_credit",
    nameAr: "باقة تحليل واحد",
    nameEn: "1 analysis pack",
    descriptionAr: "تحليل واحد لملفات المناقصة المرتبطة مع Checklist",
    price: "25.00",
    credits: 1,
    metadata: { catalogCode: "analysis_1" },
  },
  {
    type: "analysis_credit",
    nameAr: "باقة تحليلان",
    nameEn: "2 analysis pack",
    descriptionAr: "تحليلان مستقلان لدفاتر الشروط",
    price: "45.00",
    credits: 2,
    metadata: { catalogCode: "analysis_2" },
  },
  {
    type: "analysis_credit",
    nameAr: "باقة ثلاثة تحليلات",
    nameEn: "3 analysis pack",
    descriptionAr: "ثلاثة تحليلات مستقلة لدفاتر الشروط",
    price: "65.00",
    credits: 3,
    metadata: { catalogCode: "analysis_3" },
  },
  {
    type: "analysis_credit",
    nameAr: "باقة أربعة تحليلات",
    nameEn: "4 analysis pack",
    descriptionAr: "أربعة تحليلات مستقلة لدفاتر الشروط",
    price: "85.00",
    credits: 4,
    metadata: { catalogCode: "analysis_4" },
  },
  {
    type: "company_profile",
    nameAr: "تجهيز ملف الشركة الأساسي",
    nameEn: "Company profile",
    descriptionAr: "إنشاء ملف تعريفي احترافي للشركة",
    price: "15.00",
    credits: 0,
    metadata: { catalogCode: "company_profile" },
  },
  {
    type: "service",
    nameAr: "باقة النماذج المؤسسية",
    nameEn: "Business documents pack",
    descriptionAr:
      "منشئ تفاعلي لـ 12 تصميماً: بروفايل، عرض سعر، فاتورة، وعرض خدمات",
    price: "50.00",
    credits: 0,
    metadata: { catalogCode: "documents_pack", serviceCode: "documents_pack" },
  },
  {
    type: "service",
    nameAr: "تعبئة نموذج بسيط (1–2 صفحة)",
    nameEn: "Simple form filling",
    descriptionAr: "خدمة يدوية لتعبئة نموذج بسيط حسب متطلبات المناقصة",
    price: "25.00",
    metadata: { catalogCode: "form_simple", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تعبئة نموذج متوسط (3–5 صفحات)",
    nameEn: "Medium form filling",
    descriptionAr: "خدمة يدوية لتعبئة نموذج متوسط حسب المطلوب",
    price: "35.00",
    metadata: { catalogCode: "form_medium", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تعبئة نموذج معقد (أكثر من 5 صفحات)",
    nameEn: "Complex form filling",
    descriptionAr: "خدمة يدوية لتعبئة نموذج معقد حسب المطلوب",
    price: "50.00",
    metadata: { catalogCode: "form_complex", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "مراجعة نهائية لملف المناقصة قبل التقديم",
    nameEn: "Final tender review",
    descriptionAr:
      "مراجعة يدوية لملفات المناقصة قبل التقديم وتنبيه الشركة عند وجود نقص",
    price: "25.00",
    metadata: { catalogCode: "final_review", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تجهيز ملف مناقصة كامل",
    nameEn: "Full tender preparation",
    descriptionAr:
      "تحضير المناقصة من البداية للنهاية حسب الملفات المستلمة وضمان الامتثال",
    price: "150.00",
    metadata: { catalogCode: "full_tender", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تنفيذ مستعجل خلال 48 ساعة",
    nameEn: "48h rush",
    descriptionAr: "إضافة مستعجلة بنسبة +25% من قيمة الخدمة الأساسية",
    price: "0.00",
    metadata: { catalogCode: "rush_48", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تنفيذ مستعجل خلال 24 ساعة",
    nameEn: "24h rush",
    descriptionAr: "إضافة مستعجلة بنسبة +50% من قيمة الخدمة الأساسية",
    price: "0.00",
    metadata: { catalogCode: "rush_24", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "تنظيم وإعادة تسمية الملفات وفق متطلبات المناقصة",
    nameEn: "File organization",
    descriptionAr: "تنظيم الملفات وإعادة تسميتها وفق متطلبات الجهة",
    price: "25.00",
    metadata: { catalogCode: "file_organize", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "إعداد قائمة تحقق (Tender Checklist)",
    nameEn: "Tender checklist",
    descriptionAr: "إعداد قائمة تحقق يدوية لمتطلبات المناقصة",
    price: "25.00",
    metadata: { catalogCode: "manual_checklist", fulfillment: "manual" },
  },
  {
    type: "service",
    nameAr: "استخراج قائمة الوثائق المطلوبة فقط",
    nameEn: "Documents list only",
    descriptionAr: "استخراج قائمة الوثائق المطلوبة من دفتر الشروط",
    price: "25.00",
    metadata: { catalogCode: "docs_list_only", fulfillment: "manual" },
  },
];

async function main() {
  const existing = await db.select().from(products);
  let inserted = 0;
  let updated = 0;

  for (const item of CATALOG) {
    const code = String(item.metadata.catalogCode);
    const match = existing.find((row) => {
      const meta = row.metadata as {
        catalogCode?: string;
        serviceCode?: string;
      } | null;
      return (
        meta?.catalogCode === code ||
        (code === "documents_pack" && meta?.serviceCode === "documents_pack") ||
        (code === "company_profile" &&
          row.type === "company_profile" &&
          !meta?.catalogCode)
      );
    });

    if (match) {
      await db
        .update(products)
        .set({
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          descriptionAr: item.descriptionAr,
          price: item.price,
          credits: item.credits ?? 0,
          currency: "USD",
          metadata: item.metadata,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(products.id, match.id));
      updated++;
    } else {
      await db.insert(products).values({
        type: item.type,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        descriptionAr: item.descriptionAr,
        price: item.price,
        credits: item.credits ?? 0,
        currency: "USD",
        metadata: item.metadata,
        isActive: true,
      });
      inserted++;
    }
  }

  // Keep classic Excel templates active; deactivate obsolete analysis packs
  // that don't have catalogCode (old 1-file / 5-file seeds).
  for (const row of existing) {
    const meta = row.metadata as { catalogCode?: string; templateCode?: string } | null;
    if (
      row.type === "analysis_credit" &&
      !meta?.catalogCode &&
      !meta?.templateCode
    ) {
      await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, row.id));
    }
  }

  console.log(`Catalog upserted: ${inserted} inserted, ${updated} updated`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
