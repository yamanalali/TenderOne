"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { requireSession, requireSystemAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { categories, tenders } from "@/lib/db/schema";
import { tenderSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/auth";

function toDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createTenderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();

  const parsed = tenderSchema.safeParse({
    title: formData.get("title"),
    agency: formData.get("agency"),
    referenceNumber: formData.get("referenceNumber"),
    categoryId: formData.get("categoryId") || null,
    city: formData.get("city") || null,
    publishedAt: formData.get("publishedAt") || null,
    deadlineAt: formData.get("deadlineAt") || null,
    openingAt: formData.get("openingAt") || null,
    executionDuration: formData.get("executionDuration") || null,
    deliveryMethod: formData.get("deliveryMethod") || null,
    deliveryPlace: formData.get("deliveryPlace") || null,
    platformUrl: formData.get("platformUrl") || null,
    contactEmail: formData.get("contactEmail") || null,
    description: formData.get("description") || null,
    documentUrl: formData.get("documentUrl") || null,
    documentPathname: formData.get("documentPathname") || null,
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const data = parsed.data;
  const [row] = await db
    .insert(tenders)
    .values({
      ...data,
      categoryId: data.categoryId || null,
      contactEmail: data.contactEmail || null,
      publishedAt: toDate(data.publishedAt),
      deadlineAt: toDate(data.deadlineAt),
      openingAt: toDate(data.openingAt),
      createdById: session.user.id,
      isPublished: data.isPublished ?? true,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "tender.create",
    entityType: "tender",
    entityId: row.id,
  });

  revalidatePath("/tenders");
  revalidatePath("/admin/tenders");
  return { success: "تم إضافة المناقصة" };
}

export async function updateTenderAction(
  tenderId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSystemAdmin();

  const parsed = tenderSchema.safeParse({
    title: formData.get("title"),
    agency: formData.get("agency"),
    referenceNumber: formData.get("referenceNumber"),
    categoryId: formData.get("categoryId") || null,
    city: formData.get("city") || null,
    publishedAt: formData.get("publishedAt") || null,
    deadlineAt: formData.get("deadlineAt") || null,
    openingAt: formData.get("openingAt") || null,
    executionDuration: formData.get("executionDuration") || null,
    deliveryMethod: formData.get("deliveryMethod") || null,
    deliveryPlace: formData.get("deliveryPlace") || null,
    platformUrl: formData.get("platformUrl") || null,
    contactEmail: formData.get("contactEmail") || null,
    description: formData.get("description") || null,
    documentUrl: formData.get("documentUrl") || null,
    documentPathname: formData.get("documentPathname") || null,
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const data = parsed.data;
  await db
    .update(tenders)
    .set({
      ...data,
      categoryId: data.categoryId || null,
      contactEmail: data.contactEmail || null,
      publishedAt: toDate(data.publishedAt),
      deadlineAt: toDate(data.deadlineAt),
      openingAt: toDate(data.openingAt),
      isPublished: data.isPublished ?? true,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  await writeAuditLog({
    actorId: session.user.id,
    action: "tender.update",
    entityType: "tender",
    entityId: tenderId,
  });

  revalidatePath("/tenders");
  revalidatePath(`/tenders/${tenderId}`);
  revalidatePath("/admin/tenders");
  return { success: "تم تحديث المناقصة" };
}

export async function listPublishedTenders(filters: {
  q?: string;
  categoryId?: string;
  agency?: string;
  city?: string;
  status?: string;
  publishedFrom?: string;
  publishedTo?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
}) {
  await requireSession();

  const conditions = [eq(tenders.isPublished, true)];

  if (filters.q) {
    conditions.push(
      or(
        ilike(tenders.title, `%${filters.q}%`),
        ilike(tenders.agency, `%${filters.q}%`),
        ilike(tenders.referenceNumber, `%${filters.q}%`),
      )!,
    );
  }
  if (filters.categoryId) conditions.push(eq(tenders.categoryId, filters.categoryId));
  if (filters.agency) conditions.push(ilike(tenders.agency, `%${filters.agency}%`));
  if (filters.city) conditions.push(ilike(tenders.city, `%${filters.city}%`));
  if (filters.publishedFrom) {
    conditions.push(gte(tenders.publishedAt, new Date(filters.publishedFrom)));
  }
  if (filters.publishedTo) {
    conditions.push(lte(tenders.publishedAt, new Date(filters.publishedTo)));
  }
  if (filters.deadlineFrom) {
    conditions.push(gte(tenders.deadlineAt, new Date(filters.deadlineFrom)));
  }
  if (filters.deadlineTo) {
    conditions.push(lte(tenders.deadlineAt, new Date(filters.deadlineTo)));
  }

  const rows = await db
    .select({
      tender: tenders,
      categoryName: categories.nameAr,
    })
    .from(tenders)
    .leftJoin(categories, eq(categories.id, tenders.categoryId))
    .where(and(...conditions))
    .orderBy(desc(tenders.publishedAt), desc(tenders.createdAt));

  return rows;
}

export async function listCategories(activeOnly = true) {
  if (activeOnly) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.nameAr));
  }
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.nameAr));
}

export async function getDistinctAgenciesAndCities() {
  const agencies = await db
    .selectDistinct({ agency: tenders.agency })
    .from(tenders)
    .where(eq(tenders.isPublished, true))
    .orderBy(asc(tenders.agency));
  const cities = await db
    .selectDistinct({ city: tenders.city })
    .from(tenders)
    .where(and(eq(tenders.isPublished, true), sql`${tenders.city} is not null`))
    .orderBy(asc(tenders.city));
  return {
    agencies: agencies.map((a) => a.agency),
    cities: cities.map((c) => c.city).filter(Boolean) as string[],
  };
}
