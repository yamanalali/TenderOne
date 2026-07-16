"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { requireCompanySession, requireSystemAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import {
  entitlements,
  paymentOrders,
  products,
  templateFiles,
} from "@/lib/db/schema";
import { assertCompanyAccess, hasTemplateAccess } from "@/lib/permissions";
import { getAppSettings } from "@/lib/settings";
import { paymentOrderSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/auth";

export async function listActiveProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));
}

export async function createPaymentOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) return { error: "لا توجد شركة مرتبطة" };

  const parsed = paymentOrderSchema.safeParse({
    productId: formData.get("productId"),
    transferReference: formData.get("transferReference"),
    transferNote: formData.get("transferNote") || null,
    receiptUrl: formData.get("receiptUrl"),
    receiptPathname: formData.get("receiptPathname") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, parsed.data.productId), eq(products.isActive, true)))
    .limit(1);

  if (!product) return { error: "المنتج غير موجود" };

  const [order] = await db
    .insert(paymentOrders)
    .values({
      companyId: session.companyId,
      userId: session.user.id,
      productId: product.id,
      amount: product.price,
      currency: product.currency,
      status: "pending",
      transferReference: parsed.data.transferReference,
      transferNote: parsed.data.transferNote || null,
      receiptUrl: parsed.data.receiptUrl,
      receiptPathname: parsed.data.receiptPathname || null,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "payment.create",
    entityType: "payment_order",
    entityId: order.id,
  });

  revalidatePath("/payments");
  return { success: "تم إرسال طلب الدفع للمراجعة" };
}

export async function listMyPaymentOrders() {
  const session = await requireCompanySession();
  if (!session.companyId) return [];

  return db
    .select({
      order: paymentOrders,
      product: products,
    })
    .from(paymentOrders)
    .innerJoin(products, eq(products.id, paymentOrders.productId))
    .where(eq(paymentOrders.companyId, session.companyId))
    .orderBy(desc(paymentOrders.createdAt));
}

export async function listPendingPayments() {
  await requireSystemAdmin();
  return db
    .select({
      order: paymentOrders,
      product: products,
    })
    .from(paymentOrders)
    .innerJoin(products, eq(products.id, paymentOrders.productId))
    .orderBy(desc(paymentOrders.createdAt));
}

export async function reviewPaymentAction(
  orderId: string,
  decision: "approved" | "rejected",
  reviewNote?: string,
): Promise<ActionState> {
  const session = await requireSystemAdmin();

  const [row] = await db
    .select({
      order: paymentOrders,
      product: products,
    })
    .from(paymentOrders)
    .innerJoin(products, eq(products.id, paymentOrders.productId))
    .where(eq(paymentOrders.id, orderId))
    .limit(1);

  if (!row) return { error: "الطلب غير موجود" };
  if (row.order.status !== "pending") {
    return { error: "تمت مراجعة هذا الطلب مسبقاً" };
  }

  await db
    .update(paymentOrders)
    .set({
      status: decision,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
      updatedAt: new Date(),
    })
    .where(eq(paymentOrders.id, orderId));

  if (decision === "approved") {
    await grantEntitlement(row.order.companyId, row.product, orderId);
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: `payment.${decision}`,
    entityType: "payment_order",
    entityId: orderId,
    metadata: { reviewNote },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/payments");
  revalidatePath("/templates");
  revalidatePath("/analyses");
  revalidatePath("/company-profile");
  return {
    success: decision === "approved" ? "تمت الموافقة وتفعيل الخدمة" : "تم رفض الطلب",
  };
}

async function grantEntitlement(
  companyId: string,
  product: typeof products.$inferSelect,
  paymentId: string,
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
  }
}

export async function getPaymentPageData() {
  const session = await requireCompanySession();
  const [productList, orders, settings] = await Promise.all([
    listActiveProducts(),
    listMyPaymentOrders(),
    getAppSettings(),
  ]);
  return { products: productList, orders, settings, companyId: session.companyId };
}

export async function canDownloadTemplate(productId: string) {
  const session = await requireCompanySession();
  if (!session.companyId) return false;
  return hasTemplateAccess(session.companyId, productId);
}

export async function getTemplateDownload(productId: string) {
  const session = await requireCompanySession();
  if (!session.companyId) throw new Error("NO_COMPANY");
  assertCompanyAccess(session, session.companyId);

  const allowed = await hasTemplateAccess(session.companyId, productId);
  if (!allowed) throw new Error("FORBIDDEN");

  const [file] = await db
    .select()
    .from(templateFiles)
    .where(
      and(eq(templateFiles.productId, productId), eq(templateFiles.isLatest, true)),
    )
    .limit(1);

  return file || null;
}
