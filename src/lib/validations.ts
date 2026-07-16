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
  logoUrl: z.string().optional().nullable(),
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
  currency: z.string().default("SAR"),
  credits: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
