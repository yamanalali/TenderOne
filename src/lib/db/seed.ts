import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { db } from "@/lib/db";
import {
  categories,
  documentTemplates,
  products,
  systemSettings,
  users,
} from "@/lib/db/schema";
import { DOCUMENT_TEMPLATES } from "@/lib/documents/registry";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { slugify } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "توريدات",
  "أعمال إنشائية",
  "خدمات",
  "استشارات",
  "تأهيل",
  "سلل غذائية",
  "قرطاسية",
  "أدوية",
  "معدات",
  "كهرباء",
  "مياه",
  "صحة",
  "تعليم",
  "تقنية معلومات",
  "نظافة",
  "نقل",
];

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@tender-platform.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const name = process.env.SEED_ADMIN_NAME || "مدير النظام";

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingAdmin[0]) {
    await db.insert(users).values({
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "system_admin",
    });
    console.log(`Created admin: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  const existingCategories = await db.select().from(categories);
  if (!existingCategories.length) {
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((nameAr, index) => ({
        nameAr,
        slug: slugify(nameAr) || `cat-${index + 1}`,
        sortOrder: index + 1,
        isActive: true,
      })),
    );
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    if (!existing[0]) {
      await db.insert(systemSettings).values({ key, value });
    }
  }

  const existingProducts = await db.select().from(products);
  if (!existingProducts.length) {
    await db.insert(products).values([
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
          "منشئ تفاعلي لـ 12 تصميماً: بروفايل، عرض سعر، فاتورة، وعرض خدمات — مع معاينة وطباعة PDF",
        price: "50.00",
        credits: 0,
        metadata: {
          catalogCode: "documents_pack",
          serviceCode: "documents_pack",
        },
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
        type: "template",
        nameAr: "نموذج طلب شراء",
        nameEn: "Purchase request template",
        descriptionAr: "نموذج احترافي جاهز لطلب الشراء",
        price: "25.00",
        metadata: { templateCode: "purchase_request" },
      },
      {
        type: "template",
        nameAr: "نموذج طلب عرض سعر",
        nameEn: "RFQ template",
        descriptionAr: "نموذج طلب عرض سعر",
        price: "25.00",
        metadata: { templateCode: "rfq" },
      },
      {
        type: "template",
        nameAr: "نموذج مقارنة عروض الأسعار",
        nameEn: "Quote comparison template",
        descriptionAr: "نموذج مقارنة عروض الأسعار",
        price: "25.00",
        metadata: { templateCode: "quote_comparison" },
      },
      {
        type: "template",
        nameAr: "نموذج طلب دفعة",
        nameEn: "Payment request template",
        descriptionAr: "نموذج طلب دفعة",
        price: "25.00",
        metadata: { templateCode: "payment_request" },
      },
      {
        type: "template",
        nameAr: "نموذج تقييم المورد",
        nameEn: "Supplier evaluation template",
        descriptionAr: "نموذج تقييم المورد",
        price: "25.00",
        metadata: { templateCode: "supplier_evaluation" },
      },
      {
        type: "template",
        nameAr: "محضر استلام",
        nameEn: "Receiving minutes template",
        descriptionAr: "نموذج محضر استلام",
        price: "25.00",
        metadata: { templateCode: "receiving_minutes" },
      },
      {
        type: "template",
        nameAr: "إغلاق العملية",
        nameEn: "Process closure template",
        descriptionAr: "نموذج إغلاق العملية",
        price: "25.00",
        metadata: { templateCode: "process_closure" },
      },
    ]);
    console.log("Seeded products and templates");
  }

  const existingDocTemplates = await db.select().from(documentTemplates);
  if (!existingDocTemplates.length) {
    await db.insert(documentTemplates).values(
      DOCUMENT_TEMPLATES.map((t) => ({
        key: t.key,
        type: t.type,
        style: t.style,
        nameAr: t.nameAr,
        nameEn: t.nameEn,
        descriptionAr: t.descriptionAr,
        descriptionEn: t.descriptionEn,
        accentColor: t.accentColor,
        secondaryColor: t.secondaryColor,
        sortOrder: t.sortOrder,
        isActive: true,
      })),
    );
    console.log(`Seeded ${DOCUMENT_TEMPLATES.length} document templates`);
  }

  console.log("Seed completed");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
