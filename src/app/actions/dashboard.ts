"use server";

import { and, count, eq } from "drizzle-orm";
import { requireCompanySession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  analyses,
  documentInstances,
  paymentOrders,
} from "@/lib/db/schema";
import { getAnalysisCredits } from "@/lib/permissions";

export async function getDashboardStats() {
  const session = await requireCompanySession();
  if (!session.companyId) {
    return {
      credits: 0,
      analysesCount: 0,
      pendingPayments: 0,
      documentsCount: 0,
    };
  }

  const companyId = session.companyId;

  const [credits, analysesRows, pendingRows, documentsRows] = await Promise.all([
    getAnalysisCredits(companyId),
    db
      .select({ value: count() })
      .from(analyses)
      .where(eq(analyses.companyId, companyId)),
    db
      .select({ value: count() })
      .from(paymentOrders)
      .where(
        and(
          eq(paymentOrders.companyId, companyId),
          eq(paymentOrders.status, "pending"),
        ),
      ),
    db
      .select({ value: count() })
      .from(documentInstances)
      .where(eq(documentInstances.companyId, companyId)),
  ]);

  return {
    credits,
    analysesCount: Number(analysesRows[0]?.value || 0),
    pendingPayments: Number(pendingRows[0]?.value || 0),
    documentsCount: Number(documentsRows[0]?.value || 0),
  };
}
