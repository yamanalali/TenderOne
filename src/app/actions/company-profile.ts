"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { requireCompanySession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { companies, companyProfiles } from "@/lib/db/schema";
import {
  assertCompanyAccess,
  hasCompanyProfileAccess,
  isSystemAdmin,
} from "@/lib/permissions";
import { companyProfileDataSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/auth";

export async function updateCompanyDataAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) return { error: "لا توجد شركة مرتبطة" };

  const parsed = companyProfileDataSchema.safeParse({
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn") || null,
    commercialRegister: formData.get("commercialRegister") || null,
    taxCard: formData.get("taxCard") || null,
    city: formData.get("city") || null,
    country: formData.get("country") || null,
    address: formData.get("address") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    website: formData.get("website") || null,
    aboutAr: formData.get("aboutAr") || null,
    aboutEn: formData.get("aboutEn") || null,
    servicesAr: formData.get("servicesAr") || null,
    servicesEn: formData.get("servicesEn") || null,
    experienceAr: formData.get("experienceAr") || null,
    experienceEn: formData.get("experienceEn") || null,
    logoUrl: formData.get("logoUrl") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  await db
    .update(companies)
    .set({ ...parsed.data, email: parsed.data.email || null, updatedAt: new Date() })
    .where(eq(companies.id, session.companyId));

  await writeAuditLog({
    actorId: session.user.id,
    action: "company.update",
    entityType: "company",
    entityId: session.companyId,
  });

  revalidatePath("/company-profile");
  return { success: "تم حفظ بيانات الشركة" };
}

export async function createCompanyProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) return { error: "لا توجد شركة مرتبطة" };

  if (!isSystemAdmin(session)) {
    const allowed = await hasCompanyProfileAccess(session.companyId);
    if (!allowed) {
      return {
        error:
          "خدمة ملف تعريف الشركة غير مفعّلة. اشترِها من صفحة الدفع ثم أعد المحاولة.",
      };
    }
  }

  const templateKey = String(formData.get("templateKey") || "classic");
  const language = String(formData.get("language") || "ar") as
    | "ar"
    | "en"
    | "bilingual";
  const title = String(formData.get("title") || "ملف تعريف الشركة");

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  if (!company) return { error: "الشركة غير موجودة" };

  const [profile] = await db
    .insert(companyProfiles)
    .values({
      companyId: session.companyId,
      templateKey,
      language,
      title,
      content: company,
      createdById: session.user.id,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "company_profile.create",
    entityType: "company_profile",
    entityId: profile.id,
  });

  revalidatePath("/company-profile");
  return { success: profile.id };
}

export async function getCompanyAndProfiles() {
  const session = await requireCompanySession();
  if (!session.companyId) {
    return { company: null, profiles: [], hasAccess: false };
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  const profiles = await db
    .select()
    .from(companyProfiles)
    .where(eq(companyProfiles.companyId, session.companyId))
    .orderBy(desc(companyProfiles.createdAt));

  const hasAccess =
    isSystemAdmin(session) || (await hasCompanyProfileAccess(session.companyId));

  return { company, profiles, hasAccess };
}

export async function getCompanyProfile(profileId: string) {
  const session = await requireCompanySession();
  const [profile] = await db
    .select()
    .from(companyProfiles)
    .where(eq(companyProfiles.id, profileId))
    .limit(1);

  if (!profile) return null;
  assertCompanyAccess(session, profile.companyId);

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, profile.companyId))
    .limit(1);

  return { profile, company };
}
