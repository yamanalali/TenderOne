import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { db } from "@/lib/db";
import {
  categories,
  products,
  systemSettings,
  users,
} from "@/lib/db/schema";
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
        nameAr: "رصيد تحليل دفتر شروط (1 ملف)",
        nameEn: "Tender document analysis credit",
        descriptionAr: "تحليل مستقل لملف PDF واحد مع Checklist تلقائية",
        price: "149.00",
        credits: 1,
      },
      {
        type: "analysis_credit",
        nameAr: "باقة تحليل (5 ملفات)",
        nameEn: "Analysis pack (5 files)",
        descriptionAr: "خمسة تحليلات مستقلة لدفاتر الشروط",
        price: "599.00",
        credits: 5,
      },
      {
        type: "company_profile",
        nameAr: "منشئ ملف تعريف الشركة",
        nameEn: "Company profile builder",
        descriptionAr: "إنشاء ملف تعريفي احترافي بالعربية أو الإنجليزية",
        price: "199.00",
        credits: 0,
      },
      {
        type: "template",
        nameAr: "نموذج طلب شراء",
        nameEn: "Purchase request template",
        descriptionAr: "نموذج احترافي جاهز لطلب الشراء",
        price: "49.00",
        metadata: { templateCode: "purchase_request" },
      },
      {
        type: "template",
        nameAr: "نموذج طلب عرض سعر",
        nameEn: "RFQ template",
        descriptionAr: "نموذج طلب عرض سعر",
        price: "49.00",
        metadata: { templateCode: "rfq" },
      },
      {
        type: "template",
        nameAr: "نموذج مقارنة عروض الأسعار",
        nameEn: "Quote comparison template",
        descriptionAr: "نموذج مقارنة عروض الأسعار",
        price: "59.00",
        metadata: { templateCode: "quote_comparison" },
      },
      {
        type: "template",
        nameAr: "نموذج طلب دفعة",
        nameEn: "Payment request template",
        descriptionAr: "نموذج طلب دفعة",
        price: "49.00",
        metadata: { templateCode: "payment_request" },
      },
      {
        type: "template",
        nameAr: "نموذج تقييم المورد",
        nameEn: "Supplier evaluation template",
        descriptionAr: "نموذج تقييم المورد",
        price: "59.00",
        metadata: { templateCode: "supplier_evaluation" },
      },
      {
        type: "template",
        nameAr: "محضر استلام",
        nameEn: "Receiving minutes template",
        descriptionAr: "نموذج محضر استلام",
        price: "49.00",
        metadata: { templateCode: "receiving_minutes" },
      },
      {
        type: "template",
        nameAr: "إغلاق العملية",
        nameEn: "Process closure template",
        descriptionAr: "نموذج إغلاق العملية",
        price: "49.00",
        metadata: { templateCode: "process_closure" },
      },
    ]);
    console.log("Seeded products and templates");
  }

  console.log("Seed completed");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
