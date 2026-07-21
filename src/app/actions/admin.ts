"use server";

import { revalidatePath } from "next/cache";
import { asc, count, desc, eq } from "drizzle-orm";
import { requireSystemAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import {
  categories,
  entitlements,
  paymentOrders,
  products,
  templateFiles,
  tenders,
  users,
} from "@/lib/db/schema";
import {
  getAppSettings,
  getGlobalOpenAIConfig,
  saveGlobalOpenAIConfig,
  upsertSetting,
} from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { categorySchema, productSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/auth";

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const parsed = categorySchema.safeParse({
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn") || null,
    isActive: formData.get("isActive") !== "off",
    sortOrder: Number(formData.get("sortOrder") || 0),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [row] = await db
    .insert(categories)
    .values({
      nameAr: parsed.data.nameAr,
      nameEn: parsed.data.nameEn || null,
      slug: slugify(parsed.data.nameAr) || `cat-${Date.now()}`,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "category.create",
    entityType: "category",
    entityId: row.id,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/tenders");
  return { success: "تم إضافة التصنيف" };
}

export async function toggleCategoryAction(categoryId: string, isActive: boolean) {
  const session = await requireSystemAdmin();
  await db
    .update(categories)
    .set({ isActive })
    .where(eq(categories.id, categoryId));
  await writeAuditLog({
    actorId: session.user.id,
    action: "category.toggle",
    entityType: "category",
    entityId: categoryId,
    metadata: { isActive },
  });
  revalidatePath("/admin/categories");
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const values = {
    endingSoonDays: Number(formData.get("endingSoonDays") || 7),
    newTenderDays: Number(formData.get("newTenderDays") || 3),
    bankName: String(formData.get("bankName") || ""),
    bankAccountName: String(formData.get("bankAccountName") || ""),
    bankIban: String(formData.get("bankIban") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    maxUploadMb: Number(formData.get("maxUploadMb") || 100),
  };

  for (const [key, value] of Object.entries(values)) {
    await upsertSetting(key, value);
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: "settings.update",
    entityType: "system_settings",
    metadata: values,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/payments");
  revalidatePath("/tenders");
  revalidatePath("/contact");
  return { success: "تم حفظ الإعدادات" };
}

export async function saveOpenAISettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const apiKey = String(formData.get("openaiApiKey") || "");
  const model = String(formData.get("openaiModel") || "gpt-4o");

  if (apiKey && !apiKey.startsWith("sk-")) {
    return { error: "مفتاح OpenAI غير صالح" };
  }

  await saveGlobalOpenAIConfig(apiKey, model);
  await writeAuditLog({
    actorId: session.user.id,
    action: "settings.openai.update",
    entityType: "system_settings",
    metadata: { model, keyUpdated: Boolean(apiKey) },
  });

  revalidatePath("/admin/settings");
  return {
    success: apiKey
      ? "تم حفظ مفتاح OpenAI العام مشفراً"
      : "تم تحديث النموذج مع الاحتفاظ بالمفتاح الحالي",
  };
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const parsed = productSchema.safeParse({
    type: formData.get("type"),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn") || null,
    descriptionAr: formData.get("descriptionAr") || null,
    descriptionEn: formData.get("descriptionEn") || null,
    price: formData.get("price") || "0",
    currency: formData.get("currency") || "USD",
    credits: Number(formData.get("credits") || 0),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [product] = await db
    .insert(products)
    .values({
      type: parsed.data.type,
      nameAr: parsed.data.nameAr,
      nameEn: parsed.data.nameEn || null,
      descriptionAr: parsed.data.descriptionAr || null,
      descriptionEn: parsed.data.descriptionEn || null,
      price: String(parsed.data.price),
      currency: parsed.data.currency,
      credits: parsed.data.credits || 0,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  const fileUrl = String(formData.get("fileUrl") || "");
  const filePathname = String(formData.get("filePathname") || "");
  const fileName = String(formData.get("fileName") || "");

  if (parsed.data.type === "template" && fileUrl && filePathname && fileName) {
    await db.insert(templateFiles).values({
      productId: product.id,
      fileName,
      fileUrl,
      filePathname,
      version: "1.0",
      isLatest: true,
    });
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: "product.create",
    entityType: "product",
    entityId: product.id,
  });

  revalidatePath("/admin/products");
  revalidatePath("/templates");
  revalidatePath("/payments");
  return { success: "تم إضافة المنتج" };
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    type: formData.get("type"),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn") || null,
    descriptionAr: formData.get("descriptionAr") || null,
    descriptionEn: formData.get("descriptionEn") || null,
    price: formData.get("price") || "0",
    currency: formData.get("currency") || "USD",
    credits: Number(formData.get("credits") || 0),
    isActive: formData.get("isActive") === "on",
  });
}

function revalidateProductPages() {
  revalidatePath("/admin/products");
  revalidatePath("/templates");
  revalidatePath("/payments");
  revalidatePath("/my-services");
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!existing) return { error: "المنتج غير موجود" };

  await db
    .update(products)
    .set({
      type: parsed.data.type,
      nameAr: parsed.data.nameAr,
      nameEn: parsed.data.nameEn || null,
      descriptionAr: parsed.data.descriptionAr || null,
      descriptionEn: parsed.data.descriptionEn || null,
      price: String(parsed.data.price),
      currency: parsed.data.currency,
      credits: parsed.data.credits || 0,
      isActive: parsed.data.isActive ?? false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await writeAuditLog({
    actorId: session.user.id,
    action: "product.update",
    entityType: "product",
    entityId: productId,
  });

  revalidateProductPages();
  return { success: "تم حفظ تعديلات المنتج" };
}

export async function deleteProductAction(
  productId: string,
): Promise<ActionState> {
  const session = await requireSystemAdmin();
  const [existing] = await db
    .select({ id: products.id, nameAr: products.nameAr })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!existing) return { error: "المنتج غير موجود" };

  const [[order], [entitlement]] = await Promise.all([
    db
      .select({ id: paymentOrders.id })
      .from(paymentOrders)
      .where(eq(paymentOrders.productId, productId))
      .limit(1),
    db
      .select({ id: entitlements.id })
      .from(entitlements)
      .where(eq(entitlements.productId, productId))
      .limit(1),
  ]);

  if (order || entitlement) {
    return {
      error:
        "لا يمكن حذف منتج سبق طلبه أو تفعيله. عطّله من التعديل بدلاً من الحذف.",
    };
  }

  await db.delete(products).where(eq(products.id, productId));
  await writeAuditLog({
    actorId: session.user.id,
    action: "product.delete",
    entityType: "product",
    entityId: productId,
    metadata: { nameAr: existing.nameAr },
  });

  revalidateProductPages();
  return { success: "تم حذف المنتج" };
}

export async function getAdminDashboardData() {
  await requireSystemAdmin();
  const allUsers = await db.select().from(users);
  const allTenders = await db.select().from(tenders);
  const allProducts = await db.select().from(products);
  const settings = await getAppSettings();
  const cats = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  const [pendingPayments] = await db
    .select({ value: count() })
    .from(paymentOrders)
    .where(eq(paymentOrders.status, "pending"));

  return {
    usersCount: allUsers.length,
    tendersCount: allTenders.length,
    productsCount: allProducts.length,
    categoriesCount: cats.length,
    pendingPaymentsCount: Number(pendingPayments?.value || 0),
    settings,
    recentUsers: allUsers.slice(0, 5),
  };
}

export async function listAllTendersAdmin() {
  await requireSystemAdmin();
  return db
    .select({
      tender: tenders,
      categoryName: categories.nameAr,
    })
    .from(tenders)
    .leftJoin(categories, eq(categories.id, tenders.categoryId))
    .orderBy(desc(tenders.createdAt));
}

export async function listAllProductsAdmin() {
  await requireSystemAdmin();
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function listAllCategoriesAdmin() {
  await requireSystemAdmin();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getSettingsAction() {
  await requireSystemAdmin();
  const [settings, openAI] = await Promise.all([
    getAppSettings(),
    getGlobalOpenAIConfig(),
  ]);
  return {
    ...settings,
    openAIModel: openAI.model,
    openAIConfigured: Boolean(openAI.apiKey),
    openAIConfiguredInAdmin: openAI.configuredInAdmin,
  };
}
