import OpenAI from "openai";
import {
  resolveConfidence,
} from "@/lib/analysis/confidence";
import {
  analysisExtractionSchema,
  type AnalysisExtraction,
} from "@/lib/analysis/types";
import { getGlobalOpenAIConfig } from "@/lib/settings";

const SYSTEM_PROMPT = `أنت محلل خبير لدفاتر شروط المناقصات والصفقات العمومية (عربي/فرنسي/إنجليزي).
استخرج فقط ما هو موجود فعلياً في الملف. لا تختلق أرقاماً أو جهات أو مواعيد.
إذا لم تجد المعلومة بعد بحث دقيق ضع null.
أرجع JSON فقط حسب المخطط المطلوب.
دفاتر الشروط اللبنانية والعربية غالباً تذكر: الجهة الشارية، رقم الصفقة/المناقصة، آخر موعد لتقديم العروض، مدة التنفيذ، ضمان العرض، ضمان حسن التنفيذ، العملة، مدة سريان العرض، وطريقة التقديم.`;

type FileContent =
  | { type: "input_file"; file_id: string }
  | { type: "input_file"; file_url: string };

type StageProgress = (progress: number, label: string) => Promise<void> | void;

function demoExtraction(fileName: string): AnalysisExtraction {
  return {
    tenderInfo: {
      agency: "جهة غير محددة (وضع تجريبي)",
      referenceNumber: "DEMO-001",
      deadline: null,
      executionDuration: "غير محددة",
      guarantees: "كفالة ابتدائية حسب دفتر الشروط",
      currency: "USD",
      bidValidity: "90 يوماً",
    },
    submissionMethod: {
      electronicPlatform: true,
      email: false,
      handDelivery: true,
      deliveryAddress: "مقر الجهة",
      specialInstructions: "تحليل تجريبي بدون مفتاح OpenAI",
      platformUrl: null,
      contactEmail: null,
    },
    documents: [
      {
        title: "السجل التجاري",
        details: "نسخة سارية",
        pageNumber: 1,
        required: true,
      },
      {
        title: "البطاقة الضريبية",
        details: null,
        pageNumber: 1,
        required: true,
      },
    ],
    experience: [
      {
        title: "عقود مشابهة",
        details: "عقدان خلال آخر 3 سنوات",
        pageNumber: 3,
        required: true,
      },
    ],
    staff: [],
    equipment: [],
    samples: [],
    certificates: [
      {
        title: "ISO 9001",
        details: "إن وجدت",
        pageNumber: 5,
        required: false,
      },
    ],
    guarantees: [
      {
        title: "كفالة ابتدائية",
        details: "1% من قيمة العرض",
        pageNumber: 2,
        required: true,
      },
    ],
    rejectionRisks: [
      {
        title: "عدم اكتمال الوثائق",
        details: "يؤدي إلى استبعاد العرض",
        pageNumber: 6,
        required: true,
      },
    ],
    specialConditions: [],
    confidence: 42,
    summary: `تحليل تجريبي للملف ${fileName}. أضف OPENAI_API_KEY للحصول على تحليل حقيقي.`,
  };
}

function itemSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      details: { type: ["string", "null"] },
      pageNumber: { type: ["integer", "null"] },
      required: { type: "boolean" },
    },
    required: ["title", "details", "pageNumber", "required"],
  };
}

function tenderInfoSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      agency: { type: ["string", "null"] },
      referenceNumber: { type: ["string", "null"] },
      deadline: { type: ["string", "null"] },
      executionDuration: { type: ["string", "null"] },
      guarantees: { type: ["string", "null"] },
      currency: { type: ["string", "null"] },
      bidValidity: { type: ["string", "null"] },
    },
    required: [
      "agency",
      "referenceNumber",
      "deadline",
      "executionDuration",
      "guarantees",
      "currency",
      "bidValidity",
    ],
  };
}

function submissionMethodSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      electronicPlatform: { type: "boolean" },
      email: { type: "boolean" },
      handDelivery: { type: "boolean" },
      deliveryAddress: { type: ["string", "null"] },
      specialInstructions: { type: ["string", "null"] },
      platformUrl: { type: ["string", "null"] },
      contactEmail: { type: ["string", "null"] },
    },
    required: [
      "electronicPlatform",
      "email",
      "handDelivery",
      "deliveryAddress",
      "specialInstructions",
      "platformUrl",
      "contactEmail",
    ],
  };
}

async function runStructuredStage<T>(opts: {
  client: OpenAI;
  model: string;
  fileContents: FileContent[];
  name: string;
  instruction: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const response = await opts.client.responses.create({
    model: opts.model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }],
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: opts.instruction },
          ...(opts.fileContents as never[]),
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: opts.name,
        strict: true,
        schema: opts.schema,
      },
    },
  });

  return JSON.parse(response.output_text) as T;
}

function toFileContent(fileUrl: string): FileContent {
  return fileUrl.startsWith("openai:")
    ? {
        type: "input_file",
        file_id: fileUrl.slice("openai:".length),
      }
    : {
        type: "input_file",
        file_url: fileUrl,
      };
}

function mergeExtraction(parts: {
  tenderInfo: AnalysisExtraction["tenderInfo"];
  submissionMethod: AnalysisExtraction["submissionMethod"];
  checklist: Pick<
    AnalysisExtraction,
    | "documents"
    | "experience"
    | "staff"
    | "equipment"
    | "samples"
    | "certificates"
    | "guarantees"
    | "rejectionRisks"
    | "specialConditions"
  >;
  summary: string | null;
  confidence?: number;
}): AnalysisExtraction {
  return analysisExtractionSchema.parse({
    tenderInfo: parts.tenderInfo,
    submissionMethod: parts.submissionMethod,
    ...parts.checklist,
    summary: parts.summary,
    confidence: parts.confidence,
  });
}

export async function analyzePdfWithOpenAI(input: {
  fileUrl?: string;
  fileName?: string;
  files?: Array<{ fileUrl: string; fileName: string }>;
  onProgress?: StageProgress;
}): Promise<AnalysisExtraction> {
  const files =
    input.files && input.files.length > 0
      ? input.files
      : input.fileUrl && input.fileName
        ? [{ fileUrl: input.fileUrl, fileName: input.fileName }]
        : [];

  const config = await getGlobalOpenAIConfig();
  if (!config.apiKey) {
    return demoExtraction(files.map((f) => f.fileName).join(" + ") || "demo.pdf");
  }
  if (files.length === 0) {
    throw new Error("لا توجد ملفات للتحليل");
  }
  if (files.some((file) => file.fileUrl.startsWith("blob:"))) {
    throw new Error(
      "رابط الملف محلي وغير صالح للتحليل. أعد رفع ملفات PDF من صفحة تحليل جديد.",
    );
  }

  const client = new OpenAI({ apiKey: config.apiKey });
  const model = config.model;
  const fileContents = files.map((file) => toFileContent(file.fileUrl));
  const filesNote =
    files.length > 1
      ? `\nملاحظة: أُرفقت ${files.length} ملفات مرتبطة بنفس المناقصة (${files
          .map((f) => f.fileName)
          .join("، ")}). ادمج المعلومات من كل الملفات في نتيجة واحدة شاملة. إذا لم تُذكر معلومة في أي ملف ضع null.`
      : "";

  await input.onProgress?.(20, "استخراج بيانات المناقصة");

  const header = await runStructuredStage<{
    tenderInfo: AnalysisExtraction["tenderInfo"];
    summary: string | null;
  }>({
    client,
    model,
    fileContents,
    name: "tender_header",
    instruction: `المرحلة 1/4 — استخرج فقط بيانات رأس المناقصة من الصفحة الأولى والصفحات التعريفية:${filesNote}
- agency: اسم الجهة الشارية / الإدارة / الوزارة
- referenceNumber: رقم الصفقة أو المناقصة أو المرجع
- deadline: آخر موعد لتقديم العروض (مع الساعة إن وُجدت)
- executionDuration: مدة التنفيذ أو إنجاز الأشغال
- guarantees: ملخص موجز للكفالات (عرض + حسن تنفيذ)
- currency: عملة الصفقة إن ذُكرت
- bidValidity: مدة سريان العرض
ثم اكتب summary قصيراً (3–5 جمل) يصف طبيعة الصفقة دون اختلاق.`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        tenderInfo: tenderInfoSchema(),
        summary: { type: ["string", "null"] },
      },
      required: ["tenderInfo", "summary"],
    },
  });

  await input.onProgress?.(40, "استخراج طريقة التقديم");

  const submission = await runStructuredStage<{
    submissionMethod: AnalysisExtraction["submissionMethod"];
  }>({
    client,
    model,
    fileContents,
    name: "tender_submission",
    instruction: `المرحلة 2/4 — ركّز فقط على طريقة تقديم العروض:${filesNote}
حدّد بوضوح هل التقديم عبر منصة إلكترونية، بريد إلكتروني، تسليم يدوي/ظرف مغلق، أو مزيج.
املأ العنوان أو رابط المنصة أو البريد إن وُجد، وضع specialInstructions لأي تعليمات خاصة (ظرفين، ختم، موعد فتح المغلفات...).
إذا لم يُذكر أسلوب معيّن صراحةً اتركه false وnull بدون افتراض.`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        submissionMethod: submissionMethodSchema(),
      },
      required: ["submissionMethod"],
    },
  });

  await input.onProgress?.(60, "استخراج المطلوبات والقائمة");

  const checklist = await runStructuredStage<{
    documents: AnalysisExtraction["documents"];
    experience: AnalysisExtraction["experience"];
    staff: AnalysisExtraction["staff"];
    equipment: AnalysisExtraction["equipment"];
    samples: AnalysisExtraction["samples"];
    certificates: AnalysisExtraction["certificates"];
    guarantees: AnalysisExtraction["guarantees"];
    rejectionRisks: AnalysisExtraction["rejectionRisks"];
    specialConditions: AnalysisExtraction["specialConditions"];
  }>({
    client,
    model,
    fileContents,
    name: "tender_checklist",
    instruction: `المرحلة 3/4 — استخرج Checklist كاملة للمطلوبات من كل الملفات المرفوعة:
- documents: الملاحق والوثائق والمستندات المطلوب إرفاقها
- experience: شروط الخبرة والمؤهلات الفنية/المالية
- staff: الكادر المطلوب
- equipment: المعدات
- samples: العينات
- certificates: الشهادات والإفادات (ضريبة، ضمان اجتماعي، اقتصاد وتجارة...)
- guarantees: ضمان العرض / حسن التنفيذ / أي كفالات
- rejectionRisks: أسباب الرفض أو الاستبعاد
- specialConditions: شروط خاصة (سرية مصرفية، نزاهة، معاينة مواقع...)
لكل بند: عنوان واضح، تفاصيل مختصرة، رقم الصفحة إن أمكن، وهل هو مطلوب.
لا تكرر نفس البند مرتين. لا تترك الأقسام فارغة إن وُجدت بنود واضحة في الملف.`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        documents: { type: "array", items: itemSchema() },
        experience: { type: "array", items: itemSchema() },
        staff: { type: "array", items: itemSchema() },
        equipment: { type: "array", items: itemSchema() },
        samples: { type: "array", items: itemSchema() },
        certificates: { type: "array", items: itemSchema() },
        guarantees: { type: "array", items: itemSchema() },
        rejectionRisks: { type: "array", items: itemSchema() },
        specialConditions: { type: "array", items: itemSchema() },
      },
      required: [
        "documents",
        "experience",
        "staff",
        "equipment",
        "samples",
        "certificates",
        "guarantees",
        "rejectionRisks",
        "specialConditions",
      ],
    },
  });

  const draft = mergeExtraction({
    tenderInfo: header.tenderInfo,
    submissionMethod: submission.submissionMethod,
    checklist,
    summary: header.summary,
  });

  await input.onProgress?.(80, "مراجعة وتدقيق النتائج");

  const review = await runStructuredStage<{
    tenderInfo: AnalysisExtraction["tenderInfo"];
    submissionMethod: AnalysisExtraction["submissionMethod"];
    documents: AnalysisExtraction["documents"];
    experience: AnalysisExtraction["experience"];
    staff: AnalysisExtraction["staff"];
    equipment: AnalysisExtraction["equipment"];
    samples: AnalysisExtraction["samples"];
    certificates: AnalysisExtraction["certificates"];
    guarantees: AnalysisExtraction["guarantees"];
    rejectionRisks: AnalysisExtraction["rejectionRisks"];
    specialConditions: AnalysisExtraction["specialConditions"];
    summary: string | null;
    confidence: number;
    reviewNotes: string | null;
  }>({
    client,
    model,
    fileContents,
    name: "tender_review",
    instruction: `المرحلة 4/4 — راجع المسودة التالية وصحّحها بالرجوع إلى ملفات PDF المرفوعة فقط.${filesNote}

مسودة الاستخراج الحالية:
${JSON.stringify(draft, null, 2)}

المطلوب:
1) املأ أي حقول null في tenderInfo إذا كانت موجودة صراحة في الملف (خصوصاً الجهة، رقم المناقصة، الموعد، العملة، مدة التنفيذ، سريان العرض).
2) صحّح submissionMethod إن كانت المسودة تقول "لا" بينما الملف يذكر منصة/بريد/تسليم.
3) أزل التكرار من القوائم وأكمل أي مطلوب واضح ناقص.
4) حسّن الملخص ليكون دقيقاً ومختصراً.
5) أعطِ confidence عدداً صحيحاً من 0 إلى 100 فقط (ليس كسراً مثل 0.9). الثقة العالية تتطلب وجود الجهة ورقم المرجع وموعد أو طريقة تقديم + قائمة مطلوبات معقولة.
6) reviewNotes: جملة واحدة عن أبرز ما تم تصحيحه أو ما بقي غير مؤكد.`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        tenderInfo: tenderInfoSchema(),
        submissionMethod: submissionMethodSchema(),
        documents: { type: "array", items: itemSchema() },
        experience: { type: "array", items: itemSchema() },
        staff: { type: "array", items: itemSchema() },
        equipment: { type: "array", items: itemSchema() },
        samples: { type: "array", items: itemSchema() },
        certificates: { type: "array", items: itemSchema() },
        guarantees: { type: "array", items: itemSchema() },
        rejectionRisks: { type: "array", items: itemSchema() },
        specialConditions: { type: "array", items: itemSchema() },
        summary: { type: ["string", "null"] },
        confidence: { type: "number" },
        reviewNotes: { type: ["string", "null"] },
      },
      required: [
        "tenderInfo",
        "submissionMethod",
        "documents",
        "experience",
        "staff",
        "equipment",
        "samples",
        "certificates",
        "guarantees",
        "rejectionRisks",
        "specialConditions",
        "summary",
        "confidence",
        "reviewNotes",
      ],
    },
  });

  const reviewed = analysisExtractionSchema.parse({
    tenderInfo: review.tenderInfo,
    submissionMethod: review.submissionMethod,
    documents: review.documents,
    experience: review.experience,
    staff: review.staff,
    equipment: review.equipment,
    samples: review.samples,
    certificates: review.certificates,
    guarantees: review.guarantees,
    rejectionRisks: review.rejectionRisks,
    specialConditions: review.specialConditions,
    summary: review.summary,
    confidence: review.confidence,
  });

  const confidence = resolveConfidence(reviewed, review.confidence);
  return {
    ...reviewed,
    confidence,
    summary: review.reviewNotes
      ? `${reviewed.summary || ""}\n\nملاحظة المراجعة: ${review.reviewNotes}`.trim()
      : reviewed.summary,
  };
}
