import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { pushSchema } from "drizzle-kit/api";
import { eq } from "drizzle-orm";
import { setDbForTesting } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  companies,
  entitlements,
  paymentOrders,
  products,
  users,
  type Product,
} from "@/lib/db/schema";
import { grantEntitlementForProduct } from "@/lib/entitlements";
import {
  consumeAnalysisCredit,
  getAnalysisCredits,
  getDocumentAccessByType,
  hasCompanyProfileAccess,
  hasDocumentTemplateAccess,
  hasDocumentsAccess,
  hasTemplateAccess,
} from "@/lib/permissions";

let db: ReturnType<typeof drizzle<typeof schema>>;
let companyA: string;
let companyB: string;
let userId: string;

async function createProduct(
  type: Product["type"],
  credits = 0,
  metadata: Record<string, unknown> | null = null,
): Promise<Product> {
  const [product] = await db
    .insert(products)
    .values({
      type,
      nameAr: `منتج ${type}`,
      price: "100.00",
      currency: "USD",
      credits,
      isActive: true,
      metadata,
    })
    .returning();
  return product!;
}

async function approvePurchase(companyId: string, product: Product) {
  const [order] = await db
    .insert(paymentOrders)
    .values({
      companyId,
      userId,
      productId: product.id,
      amount: product.price,
      currency: product.currency,
      status: "approved",
    })
    .returning();
  await grantEntitlementForProduct(companyId, product, order!.id);
  return order!;
}

async function clearEntitlements() {
  await db.delete(entitlements);
}

before(async () => {
  const client = new PGlite();
  db = drizzle(client, { schema });

  const { apply } = await pushSchema(schema, db as never);
  await apply();

  setDbForTesting(db);

  const [user] = await db
    .insert(users)
    .values({
      email: "user@test.com",
      passwordHash: "hash",
      name: "مستخدم",
      role: "company_admin",
    })
    .returning();
  userId = user!.id;

  const [a] = await db
    .insert(companies)
    .values({ nameAr: "شركة لم تدفع" })
    .returning();
  const [b] = await db
    .insert(companies)
    .values({ nameAr: "شركة أخرى" })
    .returning();
  companyA = a!.id;
  companyB = b!.id;
});

describe("unpaid company (no entitlements)", () => {
  it("has zero analysis credits", async () => {
    await clearEntitlements();
    assert.equal(await getAnalysisCredits(companyA), 0);
  });

  it("cannot consume an analysis credit", async () => {
    await clearEntitlements();
    await assert.rejects(
      () => consumeAnalysisCredit(companyA),
      /NO_ANALYSIS_CREDIT/,
    );
  });

  it("has no company profile access", async () => {
    await clearEntitlements();
    assert.equal(await hasCompanyProfileAccess(companyA), false);
  });

  it("has no template access", async () => {
    await clearEntitlements();
    const template = await createProduct("template");
    assert.equal(await hasTemplateAccess(companyA, template.id), false);
  });

  it("has no documents builder access", async () => {
    await clearEntitlements();
    assert.equal(await hasDocumentsAccess(companyA), false);
  });
});

describe("approved analysis_credit purchase", () => {
  it("grants the purchased number of credits", async () => {
    await clearEntitlements();
    const product = await createProduct("analysis_credit", 5);
    await approvePurchase(companyA, product);
    assert.equal(await getAnalysisCredits(companyA), 5);
  });

  it("decrements credits on each consume", async () => {
    await clearEntitlements();
    const product = await createProduct("analysis_credit", 3);
    await approvePurchase(companyA, product);

    assert.equal(await consumeAnalysisCredit(companyA), 2);
    assert.equal(await consumeAnalysisCredit(companyA), 1);
    assert.equal(await getAnalysisCredits(companyA), 1);
  });

  it("deactivates the entitlement when credits run out and blocks further use", async () => {
    await clearEntitlements();
    const product = await createProduct("analysis_credit", 1);
    await approvePurchase(companyA, product);

    assert.equal(await consumeAnalysisCredit(companyA), 0);

    const [row] = await db
      .select()
      .from(entitlements)
      .where(eq(entitlements.companyId, companyA));
    assert.equal(row!.isActive, false);
    assert.equal(row!.remainingCredits, 0);

    await assert.rejects(
      () => consumeAnalysisCredit(companyA),
      /NO_ANALYSIS_CREDIT/,
    );
    assert.equal(await getAnalysisCredits(companyA), 0);
  });

  it("defaults to 1 credit when the product has no credits value", async () => {
    await clearEntitlements();
    const product = await createProduct("analysis_credit", 0);
    await approvePurchase(companyA, product);
    assert.equal(await getAnalysisCredits(companyA), 1);
  });
});

describe("approved company_profile purchase", () => {
  it("unlocks company profile and documents builder", async () => {
    await clearEntitlements();
    const product = await createProduct("company_profile");
    await approvePurchase(companyA, product);

    assert.equal(await hasCompanyProfileAccess(companyA), true);
    assert.equal(await hasDocumentsAccess(companyA), true);
  });

  it("unlocks profile documents only, not quotations or invoices", async () => {
    await clearEntitlements();
    const product = await createProduct("company_profile");
    await approvePurchase(companyA, product);

    const access = await getDocumentAccessByType(companyA);
    assert.deepEqual(access, {
      company_profile: true,
      quotation: false,
      invoice: false,
      service_brochure: false,
    });
    assert.equal(
      await hasDocumentTemplateAccess(companyA, "company_profile"),
      true,
    );
    assert.equal(await hasDocumentTemplateAccess(companyA, "invoice"), false);
  });
});

describe("approved template purchase", () => {
  it("unlocks only the purchased template", async () => {
    await clearEntitlements();
    const purchased = await createProduct("template");
    const other = await createProduct("template");
    await approvePurchase(companyA, purchased);

    assert.equal(await hasTemplateAccess(companyA, purchased.id), true);
    assert.equal(await hasTemplateAccess(companyA, other.id), false);
  });
});

describe("approved service and bundle purchases", () => {
  it("stores both as service entitlements", async () => {
    await clearEntitlements();
    await approvePurchase(companyA, await createProduct("service"));
    await approvePurchase(companyA, await createProduct("bundle"));

    const rows = await db
      .select()
      .from(entitlements)
      .where(eq(entitlements.companyId, companyA));
    assert.equal(rows.length, 2);
    assert.ok(rows.every((r) => r.type === "service"));
  });

  it("generic service does NOT unlock the documents builder", async () => {
    await clearEntitlements();
    await approvePurchase(companyA, await createProduct("service"));

    assert.equal(await hasDocumentsAccess(companyA), false);
  });

  it("documents_pack service unlocks all document types", async () => {
    await clearEntitlements();
    const pack = await createProduct("service", 0, {
      serviceCode: "documents_pack",
    });
    await approvePurchase(companyA, pack);

    const access = await getDocumentAccessByType(companyA);
    assert.deepEqual(access, {
      company_profile: true,
      quotation: true,
      invoice: true,
      service_brochure: true,
    });
    assert.equal(await hasDocumentsAccess(companyA), true);
    assert.equal(await hasDocumentTemplateAccess(companyA, "quotation"), true);
  });
});

describe("expired and inactive entitlements", () => {
  it("ignores expired entitlements", async () => {
    await clearEntitlements();
    const profile = await createProduct("company_profile");
    const credit = await createProduct("analysis_credit", 5);
    await approvePurchase(companyA, profile);
    await approvePurchase(companyA, credit);

    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.update(entitlements).set({ expiresAt: past });

    assert.equal(await hasCompanyProfileAccess(companyA), false);
    assert.equal(await getAnalysisCredits(companyA), 0);
    assert.equal(await hasDocumentsAccess(companyA), false);
  });

  it("ignores deactivated entitlements", async () => {
    await clearEntitlements();
    const profile = await createProduct("company_profile");
    await approvePurchase(companyA, profile);
    await db.update(entitlements).set({ isActive: false });

    assert.equal(await hasCompanyProfileAccess(companyA), false);
  });
});

describe("company isolation", () => {
  it("does not leak entitlements between companies", async () => {
    await clearEntitlements();
    const credit = await createProduct("analysis_credit", 5);
    const profile = await createProduct("company_profile");
    await approvePurchase(companyA, credit);
    await approvePurchase(companyA, profile);

    assert.equal(await getAnalysisCredits(companyB), 0);
    assert.equal(await hasCompanyProfileAccess(companyB), false);
    assert.equal(await hasDocumentsAccess(companyB), false);
    await assert.rejects(
      () => consumeAnalysisCredit(companyB),
      /NO_ANALYSIS_CREDIT/,
    );

    assert.equal(await getAnalysisCredits(companyA), 5);
  });
});
