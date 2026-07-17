import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  companyName: z.string().min(2, "اسم الشركة مطلوب"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const tenderSchema = z.object({
  title: z.string().min(3, "عنوان المناقصة مطلوب"),
  agency: z.string().min(2, "الجهة مطلوبة"),
  referenceNumber: z.string().min(1, "رقم المناقصة مطلوب"),
  categoryId: z.string().uuid().optional().nullable(),
  city: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  deadlineAt: z.string().optional().nullable(),
  openingAt: z.string().optional().nullable(),
  executionDuration: z.string().optional().nullable(),
  deliveryMethod: z.string().optional().nullable(),
  deliveryPlace: z.string().optional().nullable(),
  platformUrl: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  documentPathname: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

const companyLogoSchema = z
  .string()
  .max(700_000, "حجم الشعار أكبر من المسموح")
  .refine(
    (value) =>
      value.startsWith("data:image/png;base64,") ||
      value.startsWith("https://") ||
      value.startsWith("http://"),
    "صيغة رابط الشعار غير صالحة",
  )
  .optional()
  .nullable();

export const companyProfileDataSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  commercialRegister: z.string().optional().nullable(),
  taxCard: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  website: z.string().optional().nullable(),
  aboutAr: z.string().optional().nullable(),
  aboutEn: z.string().optional().nullable(),
  servicesAr: z.string().optional().nullable(),
  servicesEn: z.string().optional().nullable(),
  experienceAr: z.string().optional().nullable(),
  experienceEn: z.string().optional().nullable(),
  logoUrl: companyLogoSchema,
});

const companySnapshotSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  commercialRegister: z.string().optional().nullable(),
  taxCard: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  aboutAr: z.string().optional().nullable(),
  aboutEn: z.string().optional().nullable(),
  servicesAr: z.string().optional().nullable(),
  servicesEn: z.string().optional().nullable(),
  experienceAr: z.string().optional().nullable(),
  experienceEn: z.string().optional().nullable(),
  logoUrl: companyLogoSchema,
});

const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  unit: z.string().optional(),
});

export const profileDocumentContentSchema = z.object({
  kind: z.literal("company_profile"),
  company: companySnapshotSchema,
  tagline: z.string().optional(),
  showAbout: z.boolean(),
  showServices: z.boolean(),
  showExperience: z.boolean(),
  showContact: z.boolean(),
});

export const quotationDocumentContentSchema = z.object({
  kind: z.literal("quotation"),
  company: companySnapshotSchema,
  clientName: z.string().min(1),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  quoteNumber: z.string().min(1),
  issueDate: z.string().min(1),
  validUntil: z.string().min(1),
  currency: z.string().min(1),
  taxRate: z.number().min(0).max(100),
  items: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const invoiceDocumentContentSchema = z.object({
  kind: z.literal("invoice"),
  company: companySnapshotSchema,
  clientName: z.string().min(1),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  invoiceNumber: z.string().min(1),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.string().min(1),
  taxRate: z.number().min(0).max(100),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
  items: z.array(lineItemSchema).min(1),
  bankNotes: z.string().optional(),
  notes: z.string().optional(),
});

export const brochureDocumentContentSchema = z.object({
  kind: z.literal("service_brochure"),
  company: companySnapshotSchema,
  tagline: z.string().min(1),
  intro: z.string().min(1),
  services: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
  features: z.array(z.string()),
  scope: z.string().min(1),
  cta: z.string().min(1),
});

export const documentContentSchema = z.discriminatedUnion("kind", [
  profileDocumentContentSchema,
  quotationDocumentContentSchema,
  invoiceDocumentContentSchema,
  brochureDocumentContentSchema,
]);

export const createDocumentSchema = z.object({
  templateKey: z.string().min(1),
  title: z.string().min(2).optional(),
  language: z.enum(["ar", "en", "bilingual"]).default("ar"),
  status: z.enum(["draft", "final"]).default("draft"),
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2),
  language: z.enum(["ar", "en", "bilingual"]),
  status: z.enum(["draft", "final"]),
  content: documentContentSchema,
});

export const paymentOrderSchema = z.object({
  productId: z.string().uuid(),
  transferReference: z.string().min(2, "مرجع التحويل مطلوب"),
  transferNote: z.string().optional().nullable(),
  receiptUrl: z.string().min(1, "إشعار التحويل مطلوب"),
  receiptPathname: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const productSchema = z.object({
  type: z.enum(["analysis_credit", "company_profile", "template", "bundle", "service"]),
  nameAr: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]),
  currency: z.string().default("USD"),
  credits: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
