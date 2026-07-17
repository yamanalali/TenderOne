import { and, eq, gt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  entitlements,
  products,
  type Entitlement,
} from "@/lib/db/schema";
import type { AuthSession } from "@/lib/auth";
import type { DocumentType } from "@/lib/documents/types";

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

async function listActiveEntitlementsWithProducts(companyId: string) {
  return db
    .select({
      entitlement: entitlements,
      product: products,
    })
    .from(entitlements)
    .leftJoin(products, eq(entitlements.productId, products.id))
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

function isDocumentsPack(
  product: typeof products.$inferSelect | null,
) {
  const metadata = product?.metadata as { serviceCode?: string } | null;
  return metadata?.serviceCode === "documents_pack";
}

/** Access is scoped: the pack unlocks all documents; profile access unlocks profiles only. */
export async function hasDocumentTemplateAccess(
  companyId: string,
  documentType: DocumentType,
) {
  const rows = await listActiveEntitlementsWithProducts(companyId);
  return rows.some(({ entitlement, product }) => {
    if (entitlement.type === "service" && isDocumentsPack(product)) {
      return true;
    }
    return (
      documentType === "company_profile" &&
      entitlement.type === "company_profile"
    );
  });
}

export async function getDocumentAccessByType(companyId: string) {
  const rows = await listActiveEntitlementsWithProducts(companyId);
  const hasPack = rows.some(
    ({ entitlement, product }) =>
      entitlement.type === "service" && isDocumentsPack(product),
  );
  const hasProfile =
    hasPack ||
    rows.some(
      ({ entitlement }) => entitlement.type === "company_profile",
    );

  return {
    company_profile: hasProfile,
    quotation: hasPack,
    invoice: hasPack,
    service_brochure: hasPack,
  } satisfies Record<DocumentType, boolean>;
}

export async function hasDocumentsAccess(companyId: string) {
  const access = await getDocumentAccessByType(companyId);
  return Object.values(access).some(Boolean);
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
