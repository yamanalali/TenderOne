import { and, eq, gt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entitlements, type Entitlement } from "@/lib/db/schema";
import type { AuthSession } from "@/lib/auth";

export function isSystemAdmin(session: AuthSession) {
  return session.user.role === "system_admin";
}

export function assertCompanyAccess(
  session: AuthSession,
  companyId: string | null | undefined,
) {
  if (isSystemAdmin(session)) return;
  if (!companyId || session.companyId !== companyId) {
    throw new Error("FORBIDDEN");
  }
}

export async function listActiveEntitlements(companyId: string) {
  return db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.companyId, companyId),
        eq(entitlements.isActive, true),
        or(
          sql`${entitlements.expiresAt} is null`,
          gt(entitlements.expiresAt, new Date()),
        ),
      ),
    );
}

export async function hasTemplateAccess(companyId: string, productId: string) {
  const rows = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.companyId, companyId),
        eq(entitlements.type, "template"),
        eq(entitlements.productId, productId),
        eq(entitlements.isActive, true),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function hasCompanyProfileAccess(companyId: string) {
  const rows = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.companyId, companyId),
        eq(entitlements.type, "company_profile"),
        eq(entitlements.isActive, true),
        or(
          sql`${entitlements.expiresAt} is null`,
          gt(entitlements.expiresAt, new Date()),
        ),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function consumeAnalysisCredit(companyId: string) {
  const rows = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.companyId, companyId),
        eq(entitlements.type, "analysis_credit"),
        eq(entitlements.isActive, true),
        gt(entitlements.remainingCredits, 0),
      ),
    )
    .limit(1);

  const entitlement = rows[0] as Entitlement | undefined;
  if (!entitlement) {
    throw new Error("NO_ANALYSIS_CREDIT");
  }

  const remaining = entitlement.remainingCredits - 1;
  await db
    .update(entitlements)
    .set({
      remainingCredits: remaining,
      isActive: remaining > 0,
    })
    .where(eq(entitlements.id, entitlement.id));

  return remaining;
}

export async function getAnalysisCredits(companyId: string) {
  const rows = await listActiveEntitlements(companyId);
  return rows
    .filter((e) => e.type === "analysis_credit")
    .reduce((sum, e) => sum + e.remainingCredits, 0);
}
