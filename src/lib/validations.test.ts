import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  companyProfileDataSchema,
  createDocumentSchema,
  documentContentSchema,
  loginSchema,
  paymentOrderSchema,
  productSchema,
  registerSchema,
  tenderSchema,
  updateDocumentSchema,
} from "@/lib/validations";

const PRODUCT_UUID = "11111111-1111-4111-8111-111111111111";
const DOCUMENT_UUID = "22222222-2222-4222-8222-222222222222";

const companySnapshot = {
  nameAr: "شركة الاختبار",
  nameEn: "Test Co",
  commercialRegister: "123",
  taxCard: null,
  city: "الرياض",
  country: "SA",
  address: null,
  phone: null,
  email: "info@test.com",
  website: null,
  aboutAr: "نبذة",
  aboutEn: null,
  servicesAr: null,
  servicesEn: null,
  experienceAr: null,
  experienceEn: null,
  logoUrl: null,
};

describe("registerSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = registerSchema.parse({
      name: "أحمد",
      email: "ahmad@example.com",
      password: "password1",
      companyName: "شركة أحمد",
      phone: "0500000000",
    });
    assert.equal(parsed.email, "ahmad@example.com");
  });

  it("rejects short password", () => {
    assert.throws(() =>
      registerSchema.parse({
        name: "أحمد",
        email: "ahmad@example.com",
        password: "short",
        companyName: "شركة أحمد",
      }),
    );
  });

  it("rejects bad email", () => {
    assert.throws(() =>
      registerSchema.parse({
        name: "أحمد",
        email: "not-an-email",
        password: "password1",
        companyName: "شركة أحمد",
      }),
    );
  });

  it("rejects missing companyName", () => {
    assert.throws(() =>
      registerSchema.parse({
        name: "أحمد",
        email: "ahmad@example.com",
        password: "password1",
        companyName: "أ",
      }),
    );
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = loginSchema.parse({
      email: "user@example.com",
      password: "x",
    });
    assert.equal(parsed.email, "user@example.com");
  });

  it("rejects empty password", () => {
    assert.throws(() =>
      loginSchema.parse({
        email: "user@example.com",
        password: "",
      }),
    );
  });
});

describe("tenderSchema", () => {
  it("accepts a minimal valid payload", () => {
    const parsed = tenderSchema.parse({
      title: "مناقصة توريد",
      agency: "جهة حكومية",
      referenceNumber: "T-100",
    });
    assert.equal(parsed.referenceNumber, "T-100");
  });

  it("rejects short title", () => {
    assert.throws(() =>
      tenderSchema.parse({
        title: "أب",
        agency: "جهة",
        referenceNumber: "T-1",
      }),
    );
  });

  it("accepts empty string, valid email, and null for contactEmail", () => {
    assert.equal(
      tenderSchema.parse({
        title: "مناقصة توريد",
        agency: "جهة",
        referenceNumber: "T-1",
        contactEmail: "",
      }).contactEmail,
      "",
    );
    assert.equal(
      tenderSchema.parse({
        title: "مناقصة توريد",
        agency: "جهة",
        referenceNumber: "T-1",
        contactEmail: "a@b.com",
      }).contactEmail,
      "a@b.com",
    );
    assert.equal(
      tenderSchema.parse({
        title: "مناقصة توريد",
        agency: "جهة",
        referenceNumber: "T-1",
        contactEmail: null,
      }).contactEmail,
      null,
    );
  });

  it("rejects invalid contactEmail", () => {
    assert.throws(() =>
      tenderSchema.parse({
        title: "مناقصة توريد",
        agency: "جهة",
        referenceNumber: "T-1",
        contactEmail: "bad-email",
      }),
    );
  });
});

describe("companyProfileDataSchema", () => {
  it("accepts a minimal valid payload", () => {
    const parsed = companyProfileDataSchema.parse({ nameAr: "شركة" });
    assert.equal(parsed.nameAr, "شركة");
  });

  it("allows empty email string", () => {
    const parsed = companyProfileDataSchema.parse({
      nameAr: "شركة",
      email: "",
    });
    assert.equal(parsed.email, "");
  });
});

describe("documentContentSchema", () => {
  it("accepts company_profile content", () => {
    const parsed = documentContentSchema.parse({
      kind: "company_profile",
      company: companySnapshot,
      showAbout: true,
      showServices: true,
      showExperience: false,
      showContact: true,
    });
    assert.equal(parsed.kind, "company_profile");
  });

  it("accepts quotation content", () => {
    const parsed = documentContentSchema.parse({
      kind: "quotation",
      company: companySnapshot,
      clientName: "عميل",
      quoteNumber: "Q-1",
      issueDate: "2026-07-01",
      validUntil: "2026-08-01",
      currency: "USD",
      taxRate: 15,
      items: [
        {
          id: "1",
          description: "بند",
          quantity: 1,
          unitPrice: 100,
        },
      ],
    });
    assert.equal(parsed.kind, "quotation");
  });

  it("accepts invoice content", () => {
    const parsed = documentContentSchema.parse({
      kind: "invoice",
      company: companySnapshot,
      clientName: "عميل",
      invoiceNumber: "INV-1",
      issueDate: "2026-07-01",
      dueDate: "2026-07-15",
      currency: "USD",
      taxRate: 15,
      paymentStatus: "unpaid",
      items: [
        {
          id: "1",
          description: "بند",
          quantity: 2,
          unitPrice: 50,
        },
      ],
    });
    assert.equal(parsed.kind, "invoice");
  });

  it("accepts service_brochure content", () => {
    const parsed = documentContentSchema.parse({
      kind: "service_brochure",
      company: companySnapshot,
      tagline: "شعار",
      intro: "مقدمة",
      services: [
        { id: "1", title: "خدمة", description: "وصف" },
      ],
      features: ["ميزة"],
      scope: "نطاق",
      cta: "تواصل",
    });
    assert.equal(parsed.kind, "service_brochure");
  });

  it("rejects unknown kind", () => {
    assert.throws(() =>
      documentContentSchema.parse({
        kind: "unknown",
        company: companySnapshot,
      }),
    );
  });

  it("rejects quotation with empty items", () => {
    assert.throws(() =>
      documentContentSchema.parse({
        kind: "quotation",
        company: companySnapshot,
        clientName: "عميل",
        quoteNumber: "Q-1",
        issueDate: "2026-07-01",
        validUntil: "2026-08-01",
        currency: "USD",
        taxRate: 15,
        items: [],
      }),
    );
  });

  it("rejects taxRate above 100", () => {
    assert.throws(() =>
      documentContentSchema.parse({
        kind: "quotation",
        company: companySnapshot,
        clientName: "عميل",
        quoteNumber: "Q-1",
        issueDate: "2026-07-01",
        validUntil: "2026-08-01",
        currency: "USD",
        taxRate: 101,
        items: [
          {
            id: "1",
            description: "بند",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      }),
    );
  });

  it("enforces invoice paymentStatus enum", () => {
    assert.throws(() =>
      documentContentSchema.parse({
        kind: "invoice",
        company: companySnapshot,
        clientName: "عميل",
        invoiceNumber: "INV-1",
        issueDate: "2026-07-01",
        dueDate: "2026-07-15",
        currency: "USD",
        taxRate: 15,
        paymentStatus: "pending",
        items: [
          {
            id: "1",
            description: "بند",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      }),
    );
  });
});

describe("paymentOrderSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = paymentOrderSchema.parse({
      productId: PRODUCT_UUID,
      transferReference: "TRX-1",
      receiptUrl: "https://blob.example/receipt.pdf",
    });
    assert.equal(parsed.productId, PRODUCT_UUID);
  });

  it("rejects missing receiptUrl", () => {
    assert.throws(() =>
      paymentOrderSchema.parse({
        productId: PRODUCT_UUID,
        transferReference: "TRX-1",
        receiptUrl: "",
      }),
    );
  });

  it("rejects non-uuid productId", () => {
    assert.throws(() =>
      paymentOrderSchema.parse({
        productId: "not-a-uuid",
        transferReference: "TRX-1",
        receiptUrl: "https://blob.example/receipt.pdf",
      }),
    );
  });
});

describe("productSchema", () => {
  it("accepts price as string or number", () => {
    assert.equal(
      productSchema.parse({
        type: "service",
        nameAr: "خدمة",
        price: "99.5",
      }).price,
      "99.5",
    );
    assert.equal(
      productSchema.parse({
        type: "service",
        nameAr: "خدمة",
        price: 99.5,
      }).price,
      99.5,
    );
  });

  it("defaults currency to USD", () => {
    const parsed = productSchema.parse({
      type: "template",
      nameAr: "نموذج",
      price: 10,
    });
    assert.equal(parsed.currency, "USD");
  });

  it("rejects invalid type enum", () => {
    assert.throws(() =>
      productSchema.parse({
        type: "unknown",
        nameAr: "منتج",
        price: 1,
      }),
    );
  });
});

describe("createDocumentSchema / updateDocumentSchema", () => {
  it("applies defaults for createDocumentSchema", () => {
    const parsed = createDocumentSchema.parse({
      templateKey: "quotation_formal",
    });
    assert.equal(parsed.language, "ar");
    assert.equal(parsed.status, "draft");
  });

  it("requires uuid id for updateDocumentSchema", () => {
    assert.throws(() =>
      updateDocumentSchema.parse({
        id: "not-uuid",
        title: "عنوان",
        language: "ar",
        status: "draft",
        content: {
          kind: "company_profile",
          company: companySnapshot,
          showAbout: true,
          showServices: true,
          showExperience: true,
          showContact: true,
        },
      }),
    );

    const parsed = updateDocumentSchema.parse({
      id: DOCUMENT_UUID,
      title: "عنوان",
      language: "ar",
      status: "final",
      content: {
        kind: "company_profile",
        company: companySnapshot,
        showAbout: true,
        showServices: true,
        showExperience: true,
        showContact: true,
      },
    });
    assert.equal(parsed.id, DOCUMENT_UUID);
  });
});
