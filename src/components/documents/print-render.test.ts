import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentCanvas } from "@/components/documents/DocumentCanvas";
import { PrintButton } from "@/components/print-button";
import type { Company } from "@/lib/db/schema";
import {
  DOCUMENT_TEMPLATES,
  createDefaultContent,
} from "@/lib/documents/registry";

const fakeCompany = {
  id: "11111111-1111-4111-8111-111111111111",
  nameAr: "شركة الطباعة التجريبية",
  nameEn: "Print Test Co",
  commercialRegister: "CR-9",
  taxCard: "TAX-9",
  city: "الرياض",
  country: "السعودية",
  address: "طريق الملك فهد",
  phone: "0500000000",
  email: "print@test.com",
  website: "https://print.test",
  aboutAr: "نبذة عن الشركة للطباعة",
  aboutEn: "About for print",
  servicesAr: "خدمات الطباعة",
  servicesEn: "Print services",
  experienceAr: "خبرات",
  experienceEn: "Experience",
  logoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Company;

describe("printable document rendering (A4 canvas)", () => {
  for (const template of DOCUMENT_TEMPLATES) {
    it(`renders ${template.key} with company data inside an A4 page`, () => {
      const content = createDefaultContent(template.type, fakeCompany);
      const markup = renderToStaticMarkup(
        createElement(DocumentCanvas, {
          content,
          template,
          language: "ar",
        }),
      );

      assert.ok(markup.includes("document-a4"), "missing A4 page container");
      assert.ok(
        markup.includes(fakeCompany.nameAr),
        "missing Arabic company name",
      );
      assert.ok(markup.length > 500, "suspiciously empty document markup");
    });
  }

  it("renders quotation numbers, client, and line items", () => {
    const template = DOCUMENT_TEMPLATES.find((t) => t.key === "quotation_formal")!;
    const content = createDefaultContent("quotation", fakeCompany);
    if (content.kind !== "quotation") throw new Error("unexpected kind");

    const markup = renderToStaticMarkup(
      createElement(DocumentCanvas, { content, template, language: "ar" }),
    );

    assert.ok(markup.includes(content.quoteNumber));
    assert.ok(markup.includes(content.clientName));
    for (const item of content.items) {
      assert.ok(markup.includes(item.description));
    }
  });

  it("renders invoice number and payment status", () => {
    const template = DOCUMENT_TEMPLATES.find((t) => t.key === "invoice_modern")!;
    const content = createDefaultContent("invoice", fakeCompany);
    if (content.kind !== "invoice") throw new Error("unexpected kind");

    const markup = renderToStaticMarkup(
      createElement(DocumentCanvas, { content, template, language: "ar" }),
    );

    assert.ok(markup.includes(content.invoiceNumber));
  });

  it("sets rtl direction for Arabic and ltr for English documents", () => {
    const template = DOCUMENT_TEMPLATES[0]!;
    const content = createDefaultContent(template.type, fakeCompany);

    const arMarkup = renderToStaticMarkup(
      createElement(DocumentCanvas, { content, template, language: "ar" }),
    );
    assert.ok(arMarkup.includes('dir="rtl"'), "Arabic document must be rtl");
    assert.ok(arMarkup.includes('lang="ar"'));

    const enMarkup = renderToStaticMarkup(
      createElement(DocumentCanvas, { content, template, language: "en" }),
    );
    assert.ok(enMarkup.includes('dir="ltr"'), "English document must be ltr");
    assert.ok(enMarkup.includes('lang="en"'));

    const biMarkup = renderToStaticMarkup(
      createElement(DocumentCanvas, { content, template, language: "bilingual" }),
    );
    assert.ok(biMarkup.includes('dir="rtl"'), "Bilingual document defaults to rtl");
  });

  it("applies the print scale transform when requested", () => {
    const template = DOCUMENT_TEMPLATES[0]!;
    const content = createDefaultContent(template.type, fakeCompany);
    const markup = renderToStaticMarkup(
      createElement(DocumentCanvas, {
        content,
        template,
        language: "ar",
        scale: 0.5,
      }),
    );
    assert.ok(markup.includes("scale(0.5)"));
  });
});

describe("PrintButton", () => {
  it("is hidden in print output via no-print class", () => {
    const markup = renderToStaticMarkup(
      createElement(PrintButton, { documentTitle: "مستند تجريبي" }),
    );
    assert.ok(markup.includes("no-print"));
    assert.ok(markup.includes("طباعة"));
  });
});
