import { db } from "@/lib/db";
import { entitlements, type Product } from "@/lib/db/schema";

/**
 * Grants the entitlement matching a purchased product.
 * Called after a payment order is approved by the system admin.
 */
export async function grantEntitlementForProduct(
  companyId: string,
  product: Product,
  paymentId: string | null,
) {
  if (product.type === "analysis_credit") {
    await db.insert(entitlements).values({
      companyId,
      type: "analysis_credit",
      productId: product.id,
      remainingCredits: product.credits || 1,
      isActive: true,
      sourcePaymentId: paymentId,
    });
    return;
  }

  if (product.type === "company_profile") {
    await db.insert(entitlements).values({
      companyId,
      type: "company_profile",
      productId: product.id,
      remainingCredits: 0,
      isActive: true,
      sourcePaymentId: paymentId,
    });
    return;
  }

  if (product.type === "template") {
    await db.insert(entitlements).values({
      companyId,
      type: "template",
      productId: product.id,
      remainingCredits: 0,
      isActive: true,
      sourcePaymentId: paymentId,
    });
    return;
  }

  if (product.type === "service" || product.type === "bundle") {
    await db.insert(entitlements).values({
      companyId,
      type: "service",
      productId: product.id,
      remainingCredits: 0,
      isActive: true,
      sourcePaymentId: paymentId,
    });
  }
}
