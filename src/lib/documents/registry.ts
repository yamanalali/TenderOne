import { nanoid } from "nanoid";
import type { Company } from "@/lib/db/schema";
import {
  companyToSnapshot,
  type BrochureDocumentContent,
  type DocumentContent,
  type DocumentStyle,
  type DocumentTemplateDef,
  type DocumentType,
  type InvoiceDocumentContent,
  type ProfileDocumentContent,
  type QuotationDocumentContent,
} from "@/lib/documents/types";

export const DOCUMENT_TYPE_META: Record<
  DocumentType,
  { nameAr: string; nameEn: string; descriptionAr: string; iconLabel: string }
> = {
  company_profile: {
    nameAr: "بروفايل شركة",
    nameEn: "Company Profile",
    descriptionAr: "ملف تعريفي مؤسسي جاهز للمناقصات والعروض",
    iconLabel: "هوية",
  },
  quotation: {
    nameAr: "عرض سعر",
    nameEn: "Quotation",
    descriptionAr: "عرض أسعار احترافي ببنود وضريبة وشروط",
    iconLabel: "عرض",
  },
  invoice: {
    nameAr: "فاتورة",
    nameEn: "Invoice",
    descriptionAr: "فاتورة رسمية مع حالة الدفع والملاحظات البنكية",
    iconLabel: "فاتورة",
  },
  service_brochure: {
    nameAr: "عرض خدمات",
    nameEn: "Services Brochure",
    descriptionAr: "كتيب خدمات أنيق لعرض قدرات الشركة",
    iconLabel: "خدمات",
  },
};

export const DOCUMENT_STYLE_META: Record<
  DocumentStyle,
  { nameAr: string; nameEn: string; descriptionAr: string }
> = {
  formal: {
    nameAr: "رسمي",
    nameEn: "Formal",
    descriptionAr: "تصميم حكومي واضح بجداول وهيكل تقليدي",
  },
  modern: {
    nameAr: "عصري",
    nameEn: "Modern",
    descriptionAr: "مساحات واسعة وبطاقات أقسام بلمسة حديثة",
  },
  premium: {
    nameAr: "فاخر",
    nameEn: "Premium",
    descriptionAr: "غلاف كحلي وذهبي بتفاصيل مؤسسية راقية",
  },
};

const STYLE_COLORS: Record<
  DocumentStyle,
  { accent: string; secondary: string }
> = {
  formal: { accent: "#0f766e", secondary: "#0f172a" },
  modern: { accent: "#2563eb", secondary: "#0f172a" },
  premium: { accent: "#d4a017", secondary: "#071426" },
};

function buildTemplate(
  type: DocumentType,
  style: DocumentStyle,
  sortOrder: number,
): DocumentTemplateDef {
  const typeMeta = DOCUMENT_TYPE_META[type];
  const styleMeta = DOCUMENT_STYLE_META[style];
  const colors = STYLE_COLORS[style];
  return {
    key: `${type}_${style}`,
    type,
    style,
    nameAr: `${typeMeta.nameAr} — ${styleMeta.nameAr}`,
    nameEn: `${typeMeta.nameEn} — ${styleMeta.nameEn}`,
    descriptionAr: `${typeMeta.descriptionAr}. أسلوب ${styleMeta.nameAr}: ${styleMeta.descriptionAr}`,
    descriptionEn: `${typeMeta.nameEn}. ${styleMeta.nameEn} style for professional business documents.`,
    accentColor: colors.accent,
    secondaryColor: colors.secondary,
    sortOrder,
  };
}

export const DOCUMENT_TEMPLATES: DocumentTemplateDef[] = (
  [
    "company_profile",
    "quotation",
    "invoice",
    "service_brochure",
  ] as DocumentType[]
).flatMap((type, typeIndex) =>
  (["formal", "modern", "premium"] as DocumentStyle[]).map((style, styleIndex) =>
    buildTemplate(type, style, typeIndex * 10 + styleIndex + 1),
  ),
);

export function getDocumentTemplate(key: string) {
  return DOCUMENT_TEMPLATES.find((t) => t.key === key) ?? DOCUMENT_TEMPLATES[0];
}

export function listTemplatesByType(type?: DocumentType) {
  if (!type) return DOCUMENT_TEMPLATES;
  return DOCUMENT_TEMPLATES.filter((t) => t.type === type);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultLineItems() {
  return [
    {
      id: nanoid(8),
      description: "خدمة استشارية / توريد",
      quantity: 1,
      unitPrice: 5000,
      unit: "بند",
    },
    {
      id: nanoid(8),
      description: "تنفيذ وإشراف",
      quantity: 1,
      unitPrice: 2500,
      unit: "بند",
    },
  ];
}

export function createDefaultContent(
  type: DocumentType,
  company: Company,
): DocumentContent {
  const snapshot = companyToSnapshot(company);

  if (type === "company_profile") {
    const content: ProfileDocumentContent = {
      kind: "company_profile",
      company: snapshot,
      tagline: "شريك موثوق للعطاءات والمشاريع المؤسسية",
      showAbout: true,
      showServices: true,
      showExperience: true,
      showContact: true,
    };
    return content;
  }

  if (type === "quotation") {
    const content: QuotationDocumentContent = {
      kind: "quotation",
      company: snapshot,
      clientName: "اسم الجهة / العميل",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      quoteNumber: `Q-${Date.now().toString().slice(-6)}`,
      issueDate: todayISO(),
      validUntil: addDaysISO(30),
      currency: "USD",
      taxRate: 15,
      items: defaultLineItems(),
      notes: "الأسعار بالدولار الأمريكي وتشمل الضريبة إن لم يُذكر خلاف ذلك.",
      terms: "صلاحية العرض 30 يوماً من تاريخ الإصدار. الدفع حسب الاتفاق.",
    };
    return content;
  }

  if (type === "invoice") {
    const content: InvoiceDocumentContent = {
      kind: "invoice",
      company: snapshot,
      clientName: "اسم الجهة / العميل",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      issueDate: todayISO(),
      dueDate: addDaysISO(14),
      currency: "USD",
      taxRate: 15,
      paymentStatus: "unpaid",
      items: defaultLineItems(),
      bankNotes: "يرجى التحويل إلى الحساب البنكي المعتمد لدى الشركة مع ذكر رقم الفاتورة.",
      notes: "شكراً لتعاملكم معنا.",
    };
    return content;
  }

  const content: BrochureDocumentContent = {
    kind: "service_brochure",
    company: snapshot,
    tagline: "حلول مؤسسية بجودة عالية وتنفيذ منضبط",
    intro:
      company.aboutAr ||
      "نقدم باقة خدمات متكاملة تساعد الشركات على المنافسة في المناقصات وتنفيذ المشاريع باحتراف.",
    services: [
      {
        id: nanoid(8),
        title: "التجهيز للمناقصات",
        description: "إعداد الملفات الفنية والمالية وفق متطلبات الجهة.",
      },
      {
        id: nanoid(8),
        title: "إدارة المشاريع",
        description: "تخطيط وتنفيذ ومتابعة حتى التسليم النهائي.",
      },
      {
        id: nanoid(8),
        title: "الاستشارات التشغيلية",
        description: "تحسين الإجراءات ورفع جاهزية الفريق للعطاءات.",
      },
    ],
    features: [
      "فريق متخصص بخبرة عملية",
      "التزام بالمواعيد والجودة",
      "تقارير واضحة ومتابعة مستمرة",
      "مرونة في نطاق العمل",
    ],
    scope:
      "نغطي مراحل الدراسة والتقديم والتنفيذ والدعم بعد التسليم وفق نطاق متفق عليه.",
    cta: "تواصل معنا اليوم لبناء عرض خدمات يناسب مشروعك.",
  };
  return content;
}

const PREVIEW_COMPANY: Company = {
  id: "00000000-0000-0000-0000-000000000000",
  nameAr: "شركة الرؤية المتقدمة",
  nameEn: "Advanced Vision Co.",
  commercialRegister: "1010000000",
  taxCard: "310000000000003",
  city: "الرياض",
  country: "السعودية",
  address: "طريق الملك فهد، حي العليا",
  phone: "+966 11 000 0000",
  email: "hello@example.sa",
  website: "www.example.sa",
  aboutAr:
    "شركة سعودية متخصصة في الحلول المؤسسية وإدارة المشاريع، نعمل وفق أعلى معايير الجودة والحوكمة.",
  aboutEn:
    "A Saudi company specializing in enterprise solutions and project delivery.",
  servicesAr:
    "إدارة المشاريع\nالاستشارات التشغيلية\nتجهيز العطاءات والمناقصات",
  servicesEn:
    "Project management\nOperations consulting\nTender preparation",
  experienceAr:
    "خبرة ممتدة في تنفيذ المشاريع المؤسسية للقطاعين العام والخاص.",
  experienceEn:
    "Extensive experience delivering enterprise projects.",
  logoUrl: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export function createPreviewContent(type: DocumentType) {
  const content = createDefaultContent(type, PREVIEW_COMPANY);
  if (content.kind === "quotation") {
    return {
      ...content,
      clientName: "مؤسسة النجاح للتجارة",
      clientEmail: "purchasing@example.sa",
      clientPhone: "+966 50 000 0000",
    };
  }
  if (content.kind === "invoice") {
    return {
      ...content,
      clientName: "مؤسسة النجاح للتجارة",
      clientEmail: "accounts@example.sa",
      clientPhone: "+966 50 000 0000",
    };
  }
  return content;
}

export function defaultTitleForType(type: DocumentType) {
  return DOCUMENT_TYPE_META[type].nameAr;
}

/** Map legacy company-profile keys to new document styles */
export function mapLegacyProfileTemplate(key: string): DocumentStyle {
  if (key === "modern" || key === "company_profile_modern") return "modern";
  if (key === "corporate" || key === "premium" || key === "company_profile_premium") {
    return "premium";
  }
  if (key === "company_profile_formal" || key === "formal" || key === "classic") {
    return "formal";
  }
  return "formal";
}
