import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "company_admin",
  "system_admin",
]);

export const tenderStatusEnum = pgEnum("tender_status", [
  "open",
  "ending_soon",
  "closed",
  "new",
]);

export const submissionMethodEnum = pgEnum("submission_method", [
  "electronic_platform",
  "email",
  "hand_delivery",
  "mixed",
  "unknown",
]);

export const analysisStatusEnum = pgEnum("analysis_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "approved",
  "rejected",
]);

export const productTypeEnum = pgEnum("product_type", [
  "analysis_credit",
  "company_profile",
  "template",
  "bundle",
  "service",
]);

export const entitlementTypeEnum = pgEnum("entitlement_type", [
  "analysis_credit",
  "company_profile",
  "template",
  "service",
]);

export const profileLanguageEnum = pgEnum("profile_language", [
  "ar",
  "en",
  "bilingual",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "company_profile",
  "quotation",
  "invoice",
  "service_brochure",
]);

export const documentStyleEnum = pgEnum("document_style", [
  "formal",
  "modern",
  "premium",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "final",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  commercialRegister: varchar("commercial_register", { length: 100 }),
  taxCard: varchar("tax_card", { length: 100 }),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 120 }).default("السعودية"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  aboutAr: text("about_ar"),
  aboutEn: text("about_en"),
  servicesAr: text("services_ar"),
  servicesEn: text("services_en"),
  experienceAr: text("experience_ar"),
  experienceEn: text("experience_en"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("company_user_unique").on(table.companyId, table.userId)],
);

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameAr: varchar("name_ar", { length: 150 }).notNull(),
  nameEn: varchar("name_en", { length: 150 }),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tenders = pgTable("tenders", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  agency: varchar("agency", { length: 255 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 120 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  city: varchar("city", { length: 120 }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }),
  openingAt: timestamp("opening_at", { withTimezone: true }),
  executionDuration: varchar("execution_duration", { length: 255 }),
  deliveryMethod: varchar("delivery_method", { length: 255 }),
  deliveryPlace: text("delivery_place"),
  platformUrl: text("platform_url"),
  contactEmail: varchar("contact_email", { length: 255 }),
  description: text("description"),
  documentUrl: text("document_url"),
  documentPathname: text("document_pathname"),
  isPublished: boolean("is_published").notNull().default(true),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tenderId: uuid("tender_id").references(() => tenders.id, {
    onDelete: "set null",
  }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  filePathname: text("file_pathname").notNull(),
  status: analysisStatusEnum("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  errorMessage: text("error_message"),
  extractedData: jsonb("extracted_data"),
  pageCount: integer("page_count"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  analysisId: uuid("analysis_id")
    .notNull()
    .references(() => analyses.id, { onDelete: "cascade" }),
  section: varchar("section", { length: 100 }).notNull(),
  title: text("title").notNull(),
  details: text("details"),
  pageNumber: integer("page_number"),
  isRequired: boolean("is_required").notNull().default(true),
  isCompleted: boolean("is_completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companyProfiles = pgTable("company_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  templateKey: varchar("template_key", { length: 100 }).notNull().default("classic"),
  language: profileLanguageEnum("language").notNull().default("ar"),
  title: varchar("title", { length: 255 }),
  content: jsonb("content"),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentTemplates = pgTable(
  "document_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    type: documentTypeEnum("type").notNull(),
    style: documentStyleEnum("style").notNull(),
    nameAr: varchar("name_ar", { length: 255 }).notNull(),
    nameEn: varchar("name_en", { length: 255 }),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    accentColor: varchar("accent_color", { length: 40 }).notNull().default("#0f766e"),
    secondaryColor: varchar("secondary_color", { length: 40 }).notNull().default("#0f172a"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("document_templates_key_unique").on(table.key)],
);

export const documentInstances = pgTable("document_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  templateKey: varchar("template_key", { length: 100 }).notNull(),
  type: documentTypeEnum("type").notNull(),
  style: documentStyleEnum("style").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  language: profileLanguageEnum("language").notNull().default("ar"),
  status: documentStatusEnum("status").notNull().default("draft"),
  content: jsonb("content").notNull(),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: productTypeEnum("type").notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  credits: integer("credits").default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templateFiles = pgTable("template_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull().default("1.0"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  filePathname: text("file_pathname").notNull(),
  mimeType: varchar("mime_type", { length: 120 }),
  isLatest: boolean("is_latest").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentOrders = pgTable("payment_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  transferReference: varchar("transfer_reference", { length: 255 }),
  transferNote: text("transfer_note"),
  receiptUrl: text("receipt_url"),
  receiptPathname: text("receipt_pathname"),
  reviewedById: uuid("reviewed_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const entitlements = pgTable("entitlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: entitlementTypeEnum("type").notNull(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  remainingCredits: integer("remaining_credits").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sourcePaymentId: uuid("source_payment_id").references(() => paymentOrders.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 150 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  memberships: many(companyMembers),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  members: many(companyMembers),
  analyses: many(analyses),
  profiles: many(companyProfiles),
  documents: many(documentInstances),
  payments: many(paymentOrders),
  entitlements: many(entitlements),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tenders: many(tenders),
}));

export const tendersRelations = relations(tenders, ({ one }) => ({
  category: one(categories, {
    fields: [tenders.categoryId],
    references: [categories.id],
  }),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  company: one(companies, {
    fields: [analyses.companyId],
    references: [companies.id],
  }),
  checklistItems: many(checklistItems),
}));

export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Tender = typeof tenders.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type DocumentInstance = typeof documentInstances.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
