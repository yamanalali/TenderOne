import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Company } from "@/lib/db/schema";
import {
  DOCUMENT_TEMPLATES,
  DOCUMENT_TYPE_META,
  addDaysISO,
  createDefaultContent,
  defaultTitleForType,
  getDocumentTemplate,
  listTemplatesByType,
  mapLegacyProfileTemplate,
  todayISO,
} from "@/lib/documents/registry";
import type { DocumentType } from "@/lib/documents/types";
import { documentContentSchema } from "@/lib/validations";

const fakeCompany = {
  id: "11111111-1111-4111-8111-111111111111",
  nameAr: "شركة الاختبار",
  nameEn: "Test Company",
  commercialRegister: "CR-1",
  taxCard: "TAX-1",
  city: "الرياض",
  country: "السعودية",
  address: "عنوان",
  phone: "0500000000",
  email: "info@test.com",
  website: "https://test.com",
  aboutAr: "نبذة عن الشركة",
  aboutEn: "About",
  servicesAr: "خدمات",
  servicesEn: "Services",
  experienceAr: "خبرات",
  experienceEn: "Experience",
  logoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Company;

const documentTypes: DocumentType[] = [
  "company_profile",
  "quotation",
  "invoice",
  "service_brochure",
];

describe("DOCUMENT_TEMPLATES", () => {
  it("contains 12 templates (4 types x 3 styles)", () => {
    assert.equal(DOCUMENT_TEMPLATES.length, 12);
  });

  it("has unique keys", () => {
    const keys = DOCUMENT_TEMPLATES.map((t) => t.key);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("has valid sortOrder values", () => {
    for (const template of DOCUMENT_TEMPLATES) {
      assert.ok(Number.isInteger(template.sortOrder));
      assert.ok(template.sortOrder > 0);
    }
  });
});

describe("getDocumentTemplate", () => {
  it("returns a known template by key", () => {
    const template = getDocumentTemplate("quotation_modern");
    assert.equal(template.key, "quotation_modern");
    assert.equal(template.type, "quotation");
    assert.equal(template.style, "modern");
  });

  it("falls back to the first template for unknown keys", () => {
    const template = getDocumentTemplate("missing-key");
    assert.equal(template.key, DOCUMENT_TEMPLATES[0]!.key);
  });
});

describe("listTemplatesByType", () => {
  it("returns all templates when type is omitted", () => {
    assert.equal(listTemplatesByType().length, DOCUMENT_TEMPLATES.length);
  });

  it("filters by type", () => {
    const invoices = listTemplatesByType("invoice");
    assert.equal(invoices.length, 3);
    assert.ok(invoices.every((t) => t.type === "invoice"));
  });
});

describe("todayISO / addDaysISO", () => {
  it("returns YYYY-MM-DD format", () => {
    assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
    assert.match(addDaysISO(5), /^\d{4}-\d{2}-\d{2}$/);
  });

  it("addDaysISO(0) equals todayISO", () => {
    assert.equal(addDaysISO(0), todayISO());
  });
});

describe("createDefaultContent", () => {
  for (const type of documentTypes) {
    it(`produces schema-valid ${type} content`, () => {
      const content = createDefaultContent(type, fakeCompany);
      const parsed = documentContentSchema.parse(content);
      assert.equal(parsed.kind, type);
    });
  }
});

describe("mapLegacyProfileTemplate", () => {
  it("maps legacy keys correctly", () => {
    assert.equal(mapLegacyProfileTemplate("modern"), "modern");
    assert.equal(mapLegacyProfileTemplate("company_profile_modern"), "modern");
    assert.equal(mapLegacyProfileTemplate("corporate"), "premium");
    assert.equal(mapLegacyProfileTemplate("premium"), "premium");
    assert.equal(mapLegacyProfileTemplate("company_profile_premium"), "premium");
    assert.equal(mapLegacyProfileTemplate("formal"), "formal");
    assert.equal(mapLegacyProfileTemplate("classic"), "formal");
    assert.equal(mapLegacyProfileTemplate("company_profile_formal"), "formal");
  });

  it("defaults unknown keys to formal", () => {
    assert.equal(mapLegacyProfileTemplate("unknown-style"), "formal");
  });
});

describe("defaultTitleForType", () => {
  it("returns Arabic name for each type", () => {
    for (const type of documentTypes) {
      assert.equal(defaultTitleForType(type), DOCUMENT_TYPE_META[type].nameAr);
    }
  });
});
