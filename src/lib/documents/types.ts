import type { Company } from "@/lib/db/schema";

export type DocumentType =
  | "company_profile"
  | "quotation"
  | "invoice"
  | "service_brochure";

export type DocumentStyle = "formal" | "modern" | "premium";

export type DocumentLanguage = "ar" | "en" | "bilingual";

export type CompanySnapshot = {
  nameAr: string;
  nameEn?: string | null;
  commercialRegister?: string | null;
  taxCard?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  aboutAr?: string | null;
  aboutEn?: string | null;
  servicesAr?: string | null;
  servicesEn?: string | null;
  experienceAr?: string | null;
  experienceEn?: string | null;
  logoUrl?: string | null;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
};

export type ProfileDocumentContent = {
  kind: "company_profile";
  company: CompanySnapshot;
  tagline?: string;
  showAbout: boolean;
  showServices: boolean;
  showExperience: boolean;
  showContact: boolean;
};

export type QuotationDocumentContent = {
  kind: "quotation";
  company: CompanySnapshot;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  currency: string;
  taxRate: number;
  items: LineItem[];
  notes?: string;
  terms?: string;
};

export type InvoiceDocumentContent = {
  kind: "invoice";
  company: CompanySnapshot;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  items: LineItem[];
  bankNotes?: string;
  notes?: string;
};

export type BrochureServiceItem = {
  id: string;
  title: string;
  description: string;
};

export type BrochureDocumentContent = {
  kind: "service_brochure";
  company: CompanySnapshot;
  tagline: string;
  intro: string;
  services: BrochureServiceItem[];
  features: string[];
  scope: string;
  cta: string;
};

export type DocumentContent =
  | ProfileDocumentContent
  | QuotationDocumentContent
  | InvoiceDocumentContent
  | BrochureDocumentContent;

export type DocumentTemplateDef = {
  key: string;
  type: DocumentType;
  style: DocumentStyle;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  accentColor: string;
  secondaryColor: string;
  sortOrder: number;
};

export function companyToSnapshot(company: Company): CompanySnapshot {
  return {
    nameAr: company.nameAr,
    nameEn: company.nameEn,
    commercialRegister: company.commercialRegister,
    taxCard: company.taxCard,
    city: company.city,
    country: company.country,
    address: company.address,
    phone: company.phone,
    email: company.email,
    website: company.website,
    aboutAr: company.aboutAr,
    aboutEn: company.aboutEn,
    servicesAr: company.servicesAr,
    servicesEn: company.servicesEn,
    experienceAr: company.experienceAr,
    experienceEn: company.experienceEn,
    logoUrl: company.logoUrl,
  };
}

export function calcLineTotal(item: LineItem) {
  return item.quantity * item.unitPrice;
}

export function calcSubtotal(items: LineItem[]) {
  return items.reduce((sum, item) => sum + calcLineTotal(item), 0);
}

export function calcTax(subtotal: number, taxRate: number) {
  return (subtotal * taxRate) / 100;
}

export function calcGrandTotal(items: LineItem[], taxRate: number) {
  const subtotal = calcSubtotal(items);
  return subtotal + calcTax(subtotal, taxRate);
}

export function formatMoney(value: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
}
