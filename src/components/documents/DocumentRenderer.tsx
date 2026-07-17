import { BrochureFormal } from "@/components/documents/brochures/formal";
import { BrochureModern } from "@/components/documents/brochures/modern";
import { BrochurePremium } from "@/components/documents/brochures/premium";
import { InvoiceFormal } from "@/components/documents/invoices/formal";
import { InvoiceModern } from "@/components/documents/invoices/modern";
import { InvoicePremium } from "@/components/documents/invoices/premium";
import { ProfileFormal } from "@/components/documents/profiles/formal";
import { ProfileModern } from "@/components/documents/profiles/modern";
import { ProfilePremium } from "@/components/documents/profiles/premium";
import { QuotationFormal } from "@/components/documents/quotations/formal";
import { QuotationModern } from "@/components/documents/quotations/modern";
import { QuotationPremium } from "@/components/documents/quotations/premium";
import type { DocumentTemplateDef } from "@/lib/documents/types";
import type {
  BrochureDocumentContent,
  DocumentContent,
  DocumentLanguage,
  InvoiceDocumentContent,
  ProfileDocumentContent,
  QuotationDocumentContent,
} from "@/lib/documents/types";

export function DocumentRenderer({
  content,
  template,
  language,
}: {
  content: DocumentContent;
  template: DocumentTemplateDef;
  language: DocumentLanguage;
}) {
  const accent = template.accentColor;
  const secondary = template.secondaryColor;

  if (content.kind === "company_profile") {
    const props = {
      content: content as ProfileDocumentContent,
      language,
      accent,
      secondary,
    };
    if (template.style === "modern") return <ProfileModern {...props} />;
    if (template.style === "premium") return <ProfilePremium {...props} />;
    return <ProfileFormal {...props} />;
  }

  if (content.kind === "quotation") {
    const props = {
      content: content as QuotationDocumentContent,
      accent,
      secondary,
    };
    if (template.style === "modern") return <QuotationModern {...props} />;
    if (template.style === "premium") return <QuotationPremium {...props} />;
    return <QuotationFormal {...props} />;
  }

  if (content.kind === "invoice") {
    const props = {
      content: content as InvoiceDocumentContent,
      accent,
      secondary,
    };
    if (template.style === "modern") return <InvoiceModern {...props} />;
    if (template.style === "premium") return <InvoicePremium {...props} />;
    return <InvoiceFormal {...props} />;
  }

  const props = {
    content: content as BrochureDocumentContent,
    accent,
    secondary,
  };
  if (template.style === "modern") return <BrochureModern {...props} />;
  if (template.style === "premium") return <BrochurePremium {...props} />;
  return <BrochureFormal {...props} />;
}
