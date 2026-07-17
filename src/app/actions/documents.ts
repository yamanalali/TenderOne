"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import type { ActionState } from "@/app/actions/auth";
import { requireCompanySession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { companies, documentInstances } from "@/lib/db/schema";
import {
  createDefaultContent,
  defaultTitleForType,
  DOCUMENT_TEMPLATES,
  getDocumentTemplate,
} from "@/lib/documents/registry";
import type { DocumentContent, DocumentType } from "@/lib/documents/types";
import {
  assertCompanyAccess,
  getDocumentAccessByType,
  hasDocumentTemplateAccess,
  isSystemAdmin,
} from "@/lib/permissions";
import {
  createDocumentSchema,
  documentContentSchema,
  updateDocumentSchema,
} from "@/lib/validations";

async function ensureDocumentsAccess(
  companyId: string,
  documentType: DocumentType,
  sessionRoleOk: boolean,
) {
  if (sessionRoleOk) return true;
  return hasDocumentTemplateAccess(companyId, documentType);
}

export async function listDocumentTemplatesAction(type?: DocumentType) {
  await requireCompanySession();
  if (!type) return DOCUMENT_TEMPLATES;
  return DOCUMENT_TEMPLATES.filter((t) => t.type === type);
}

export async function getDocumentsPageData(type?: DocumentType) {
  const session = await requireCompanySession();
  if (!session.companyId) {
    return {
      company: null,
      templates: type
        ? DOCUMENT_TEMPLATES.filter((t) => t.type === type)
        : DOCUMENT_TEMPLATES,
      documents: [],
      hasAccess: false,
      accessByType: {
        company_profile: false,
        quotation: false,
        invoice: false,
        service_brochure: false,
      },
    };
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  const documentsQuery = db
    .select()
    .from(documentInstances)
    .where(
      type
        ? and(
            eq(documentInstances.companyId, session.companyId),
            eq(documentInstances.type, type),
          )
        : eq(documentInstances.companyId, session.companyId),
    )
    .orderBy(desc(documentInstances.updatedAt));

  const allDocuments = await documentsQuery;
  const accessByType = isSystemAdmin(session)
    ? {
        company_profile: true,
        quotation: true,
        invoice: true,
        service_brochure: true,
      }
    : await getDocumentAccessByType(session.companyId);
  const hasAccess = Object.values(accessByType).some(Boolean);
  const documents = allDocuments.filter((doc) => accessByType[doc.type]);

  return {
    company,
    templates: type
      ? DOCUMENT_TEMPLATES.filter((t) => t.type === type)
      : DOCUMENT_TEMPLATES,
    documents,
    hasAccess,
    accessByType,
  };
}

export async function createDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) return { error: "لا توجد شركة مرتبطة" };

  const parsed = createDocumentSchema.safeParse({
    templateKey: formData.get("templateKey"),
    title: formData.get("title") || undefined,
    language: formData.get("language") || "ar",
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const template = getDocumentTemplate(parsed.data.templateKey);
  if (template.key !== parsed.data.templateKey) {
    return { error: "القالب غير موجود" };
  }

  const allowed = await ensureDocumentsAccess(
    session.companyId,
    template.type,
    isSystemAdmin(session),
  );
  if (!allowed) {
    return {
      error:
        "هذا النموذج للمعاينة فقط. اشترِ الباقة ثم أعد المحاولة.",
    };
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  if (!company) return { error: "الشركة غير موجودة" };

  const content = createDefaultContent(template.type, company);
  const title = parsed.data.title || defaultTitleForType(template.type);

  const [doc] = await db
    .insert(documentInstances)
    .values({
      companyId: session.companyId,
      templateKey: template.key,
      type: template.type,
      style: template.style,
      title,
      language: parsed.data.language,
      status: parsed.data.status,
      content,
      createdById: session.user.id,
    })
    .returning();

  await writeAuditLog({
    actorId: session.user.id,
    action: "document.create",
    entityType: "document_instance",
    entityId: doc.id,
    metadata: { templateKey: template.key },
  });

  revalidatePath("/templates");
  revalidatePath("/documents");
  return {
    success: "تم إنشاء المستند",
    redirectTo: `/documents/${doc.id}`,
  };
}

export async function updateDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireCompanySession();
  if (!session.companyId) return { error: "لا توجد شركة مرتبطة" };

  let contentRaw: unknown;
  try {
    contentRaw = JSON.parse(String(formData.get("content") || "{}"));
  } catch {
    return { error: "محتوى المستند غير صالح" };
  }

  const parsed = updateDocumentSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    language: formData.get("language"),
    status: formData.get("status"),
    content: contentRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [existing] = await db
    .select()
    .from(documentInstances)
    .where(eq(documentInstances.id, parsed.data.id))
    .limit(1);

  if (!existing) return { error: "المستند غير موجود" };
  assertCompanyAccess(session, existing.companyId);
  const allowed = await ensureDocumentsAccess(
    existing.companyId,
    existing.type,
    isSystemAdmin(session),
  );
  if (!allowed) {
    return { error: "يلزم شراء النموذج قبل تعديل المحتوى" };
  }

  await db
    .update(documentInstances)
    .set({
      title: parsed.data.title,
      language: parsed.data.language,
      status: parsed.data.status,
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(eq(documentInstances.id, parsed.data.id));

  await writeAuditLog({
    actorId: session.user.id,
    action: "document.update",
    entityType: "document_instance",
    entityId: parsed.data.id,
  });

  revalidatePath(`/documents/${parsed.data.id}`);
  revalidatePath("/documents");
  revalidatePath("/templates");
  return { success: "تم حفظ المستند" };
}

export async function deleteDocumentAction(documentId: string): Promise<ActionState> {
  const session = await requireCompanySession();
  const [existing] = await db
    .select()
    .from(documentInstances)
    .where(eq(documentInstances.id, documentId))
    .limit(1);

  if (!existing) return { error: "المستند غير موجود" };
  assertCompanyAccess(session, existing.companyId);

  await db.delete(documentInstances).where(eq(documentInstances.id, documentId));

  await writeAuditLog({
    actorId: session.user.id,
    action: "document.delete",
    entityType: "document_instance",
    entityId: documentId,
  });

  revalidatePath("/documents");
  revalidatePath("/templates");
  return { success: "تم حذف المستند" };
}

export async function getDocumentById(documentId: string) {
  const session = await requireCompanySession();
  const [doc] = await db
    .select()
    .from(documentInstances)
    .where(eq(documentInstances.id, documentId))
    .limit(1);

  if (!doc) return null;
  assertCompanyAccess(session, doc.companyId);
  const allowed = await ensureDocumentsAccess(
    doc.companyId,
    doc.type,
    isSystemAdmin(session),
  );
  if (!allowed) return null;

  const contentResult = documentContentSchema.safeParse(doc.content);
  const content = (contentResult.success
    ? contentResult.data
    : doc.content) as DocumentContent;

  return {
    document: doc,
    content,
    template: getDocumentTemplate(doc.templateKey),
  };
}
