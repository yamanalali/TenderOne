import { get } from "@vercel/blob";
import OpenAI, { toFile } from "openai";
import { PDFDocument } from "pdf-lib";
import {
  resolveConfidence,
} from "@/lib/analysis/confidence";
import {
  analysisExtractionSchema,
  type AnalysisExtraction,
} from "@/lib/analysis/types";
import { getGlobalOpenAIConfig } from "@/lib/settings";

/**
 * Keep chunks small: Hobby/lower OpenAI tiers often cap ~30k TPM per request.
 * Dense Arabic tender PDFs can exceed that around ~12–15 pages with images.
 */
const PAGES_PER_ANALYSIS_CHUNK = 10;
const PAGES_PER_ANALYSIS_CHUNK_RETRY = 6;
/** Pause between model calls so TPM budgets can recover. */
const STAGE_PAUSE_MS = 2000;

type AnalysisFileInput = {
  fileUrl: string;
  fileName: string;
  /** Vercel Blob pathname for re-download (OpenAI user_data files are not downloadable). */
  sourcePathname?: string;
};

function isBlobSourcePathname(pathname?: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("openai:")) return false;
  if (pathname.startsWith("file-")) return false;
  return pathname.includes("/") || pathname.startsWith("analysis");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SYSTEM_PROMPT = `أنت محلل خبير لدفاتر شروط المناقصات والصفقات العمومية (عربي/فرنسي/إنجليزي).
استخرج فقط ما هو موجود فعلياً في الملف. لا تختلق أرقاماً أو جهات أو مواعيد.
إذا لم تجد المعلومة بعد بحث دقيق ضع null.
أرجع JSON فقط حسب المخطط المطلوب.
دفاتر الشروط اللبنانية والعربية غالباً تذكر: الجهة الشارية، رقم الصفقة/المناقصة، آخر موعد لتقديم العروض، مدة التنفيذ، ضمان العرض، ضمان حسن التنفيذ، العملة، مدة سريان العرض، وطريقة التقديم.`;

type FileDetail = "low" | "high" | "auto";

type FileContent =
  | { type: "input_file"; file_id: string; detail?: FileDetail }
  | { type: "input_file"; file_url: string; detail?: FileDetail };

type StageProgress = (progress: number, label: string) => Promise<void> | void;

type ChecklistSections = Pick<
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

const CHECKLIST_KEYS: Array<keyof ChecklistSections> = [
  "documents",
  "experience",
  "staff",
  "equipment",
  "samples",
  "certificates",
  "guarantees",
  "rejectionRisks",
  "specialConditions",
];

function isContextOverflowError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /context window|context_length|maximum context|too many tokens|input.*too large/i.test(
    message,
  );
}

function isTokenBudgetError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    isContextOverflowError(error) ||
    /429|rate limit|tokens per min|\bTPM\b|Request too large|reduce.*tokens/i.test(
      message,
    )
  );
}

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
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
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
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      // Soft rate-limit: wait and retry same payload. Hard "Request too large"
      // must be handled by smaller PDF chunks upstream.
      if (
        /429|rate limit|tokens per min|\bTPM\b/i.test(message) &&
        !/Request too large/i.test(message) &&
        attempt < 2
      ) {
        await sleep(STAGE_PAUSE_MS * (attempt + 2));
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("فشل طلب التحليل بعد عدة محاولات");
}

function toFileContent(
  fileUrl: string,
  detail: FileDetail = "low",
): FileContent {
  // detail:low reduces PDF page-image tokens (critical for 100+ page tenders).
  return fileUrl.startsWith("openai:")
    ? {
        type: "input_file",
        file_id: fileUrl.slice("openai:".length),
        detail,
      }
    : {
        type: "input_file",
        file_url: fileUrl,
        detail,
      };
}

function emptyChecklist(): ChecklistSections {
  return {
    documents: [],
    experience: [],
    staff: [],
    equipment: [],
    samples: [],
    certificates: [],
    guarantees: [],
    rejectionRisks: [],
    specialConditions: [],
  };
}

function mergeChecklistItems(
  lists: ChecklistSections[],
): ChecklistSections {
  const merged = emptyChecklist();
  for (const key of CHECKLIST_KEYS) {
    const seen = new Set<string>();
    for (const list of lists) {
      for (const item of list[key]) {
        const dedupeKey = `${item.title.trim().toLowerCase()}|${item.pageNumber ?? ""}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        merged[key].push(item);
      }
    }
  }
  return merged;
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

const checklistSchema = {
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
} as const;

async function extractHeader(opts: {
  client: OpenAI;
  model: string;
  fileContents: FileContent[];
  filesNote: string;
}) {
  return runStructuredStage<{
    tenderInfo: AnalysisExtraction["tenderInfo"];
    summary: string | null;
  }>({
    client: opts.client,
    model: opts.model,
    fileContents: opts.fileContents,
    name: "tender_header",
    instruction: `المرحلة 1 — استخرج فقط بيانات رأس المناقصة من الصفحات التعريفية الأولى:${opts.filesNote}
- agency / referenceNumber / deadline / executionDuration / guarantees / currency / bidValidity
ثم summary قصير (3–5 جمل) دون اختلاق. إن لم تجد معلومة ضع null.`,
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
}

async function extractSubmission(opts: {
  client: OpenAI;
  model: string;
  fileContents: FileContent[];
  filesNote: string;
}) {
  return runStructuredStage<{
    submissionMethod: AnalysisExtraction["submissionMethod"];
  }>({
    client: opts.client,
    model: opts.model,
    fileContents: opts.fileContents,
    name: "tender_submission",
    instruction: `المرحلة 2 — ركّز فقط على طريقة تقديم العروض:${opts.filesNote}
حدّد المنصة الإلكترونية / البريد / التسليم اليدوي، والعنوان أو الرابط أو البريد إن وُجد.
لا تفترض أسلوباً غير مذكور صراحة.`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        submissionMethod: submissionMethodSchema(),
      },
      required: ["submissionMethod"],
    },
  });
}

async function extractChecklist(opts: {
  client: OpenAI;
  model: string;
  fileContents: FileContent[];
  filesNote: string;
}) {
  return runStructuredStage<ChecklistSections>({
    client: opts.client,
    model: opts.model,
    fileContents: opts.fileContents,
    name: "tender_checklist",
    instruction: `المرحلة 3 — استخرج Checklist للمطلوبات:${opts.filesNote}
الأقسام: documents, experience, staff, equipment, samples, certificates, guarantees, rejectionRisks, specialConditions.
لكل بند: عنوان، تفاصيل مختصرة، رقم صفحة إن أمكن، وهل مطلوب. لا تكرر البنود.`,
    schema: checklistSchema as unknown as Record<string, unknown>,
  });
}

async function reviewDraft(opts: {
  client: OpenAI;
  model: string;
  draft: AnalysisExtraction;
}) {
  // Never re-attach PDFs here — draft + large PDF exceeds model context.
  const compactDraft = JSON.stringify(opts.draft);
  return runStructuredStage<{
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
    client: opts.client,
    model: opts.model,
    fileContents: [],
    name: "tender_review",
    instruction: `المرحلة الأخيرة — راجع المسودة التالية فقط (بدون ملف PDF). لا تختلق مطلوبات جديدة غير موجودة في المسودة.
أزل التكرار، وحسّن الملخص، وأعطِ confidence من 0 إلى 100، وreviewNotes بجملة واحدة.

المسودة:
${compactDraft}`,
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
}

async function analyzeFilesTogether(opts: {
  client: OpenAI;
  model: string;
  files: Array<{ fileUrl: string; fileName: string }>;
  onProgress?: StageProgress;
}): Promise<AnalysisExtraction> {
  const fileContents = opts.files.map((file) =>
    toFileContent(file.fileUrl, "low"),
  );
  const filesNote =
    opts.files.length > 1
      ? `\nملاحظة: أُرفقت ${opts.files.length} ملفات (${opts.files
          .map((f) => f.fileName)
          .join("، ")}). ادمج النتيجة.`
      : "";

  await opts.onProgress?.(20, "استخراج بيانات المناقصة");
  const header = await extractHeader({
    client: opts.client,
    model: opts.model,
    fileContents,
    filesNote,
  });
  await sleep(STAGE_PAUSE_MS);

  await opts.onProgress?.(40, "استخراج طريقة التقديم");
  const submission = await extractSubmission({
    client: opts.client,
    model: opts.model,
    fileContents,
    filesNote,
  });
  await sleep(STAGE_PAUSE_MS);

  await opts.onProgress?.(60, "استخراج المطلوبات والقائمة");
  const checklist = await extractChecklist({
    client: opts.client,
    model: opts.model,
    fileContents,
    filesNote,
  });
  await sleep(STAGE_PAUSE_MS);

  const draft = mergeExtraction({
    tenderInfo: header.tenderInfo,
    submissionMethod: submission.submissionMethod,
    checklist,
    summary: header.summary,
  });

  await opts.onProgress?.(80, "مراجعة وتدقيق النتائج");
  const review = await reviewDraft({
    client: opts.client,
    model: opts.model,
    draft,
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

/** One-file-at-a-time path for PDFs that exceed a single context window. */
async function analyzeFilesChunked(opts: {
  client: OpenAI;
  model: string;
  files: Array<{ fileUrl: string; fileName: string }>;
  onProgress?: StageProgress;
}): Promise<AnalysisExtraction> {
  const checklistParts: ChecklistSections[] = [];
  let tenderInfo: AnalysisExtraction["tenderInfo"] | null = null;
  let submissionMethod: AnalysisExtraction["submissionMethod"] | null = null;
  let summary: string | null = null;

  for (let index = 0; index < opts.files.length; index += 1) {
    const file = opts.files[index]!;
    const fileContents = [toFileContent(file.fileUrl, "low")];
    const filesNote = `\nملف ${index + 1}/${opts.files.length}: ${file.fileName}`;
    const baseProgress = 15 + Math.round((index / opts.files.length) * 55);

    await opts.onProgress?.(
      baseProgress,
      `تحليل مجزأ: ${file.fileName} (${index + 1}/${opts.files.length})`,
    );

    // Header + submission only from the first chunk to stay under TPM caps.
    if (!tenderInfo) {
      const header = await extractHeader({
        client: opts.client,
        model: opts.model,
        fileContents,
        filesNote,
      });
      tenderInfo = header.tenderInfo;
      summary = header.summary;
      await sleep(STAGE_PAUSE_MS);

      const submission = await extractSubmission({
        client: opts.client,
        model: opts.model,
        fileContents,
        filesNote,
      });
      submissionMethod = submission.submissionMethod;
      await sleep(STAGE_PAUSE_MS);
    }

    const checklist = await extractChecklist({
      client: opts.client,
      model: opts.model,
      fileContents,
      filesNote,
    });
    checklistParts.push(checklist);
    await sleep(STAGE_PAUSE_MS);
  }

  if (!tenderInfo || !submissionMethod) {
    throw new Error(
      "تعذر استخراج بيانات المناقصة من الملف الكبير. جرّب تقسيم PDF إلى أجزاء أصغر (مثلاً 40–60 صفحة) أو استخدم نموذجاً بسياق أكبر مثل gpt-4.1.",
    );
  }

  const draft = mergeExtraction({
    tenderInfo,
    submissionMethod,
    checklist: mergeChecklistItems(checklistParts),
    summary,
  });

  await opts.onProgress?.(85, "مراجعة النتائج المدمجة");
  try {
    const review = await reviewDraft({
      client: opts.client,
      model: opts.model,
      draft,
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
  } catch {
    // If review itself fails (huge checklist), return the merged draft.
    const confidence = resolveConfidence(draft, draft.confidence);
    return { ...draft, confidence };
  }
}

async function downloadPdfBytesForSplit(opts: {
  fileUrl: string;
  sourcePathname?: string;
}): Promise<Uint8Array> {
  // Prefer Vercel Blob — OpenAI rejects downloads for purpose=user_data.
  if (isBlobSourcePathname(opts.sourcePathname)) {
    const result = await get(opts.sourcePathname!, { access: "private" });
    if (result?.stream) {
      return new Uint8Array(await new Response(result.stream).arrayBuffer());
    }
  }

  if (opts.fileUrl.startsWith("openai:")) {
    throw new Error(
      "لا يمكن تقسيم هذا الملف تلقائياً لأنه رُفع سابقاً بدون مسار Blob. أعد رفع الـ PDF من صفحة تحليل جديد ثم شغّل التحليل مجدداً.",
    );
  }

  if (opts.fileUrl.startsWith("http://") || opts.fileUrl.startsWith("https://")) {
    const response = await fetch(opts.fileUrl);
    if (!response.ok) {
      throw new Error("تعذر تنزيل ملف PDF لتقسيمه قبل التحليل");
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  throw new Error(
    "تعذر الوصول إلى ملف PDF للتقسيم. أعد رفع الملف من صفحة تحليل جديد.",
  );
}

/** Split one large PDF into page-range chunks uploaded back to OpenAI Files. */
async function splitPdfIntoOpenAIChunks(opts: {
  client: OpenAI;
  file: AnalysisFileInput;
  pagesPerChunk?: number;
}): Promise<AnalysisFileInput[]> {
  const pagesPerChunk = opts.pagesPerChunk ?? PAGES_PER_ANALYSIS_CHUNK;
  const bytes = await downloadPdfBytesForSplit({
    fileUrl: opts.file.fileUrl,
    sourcePathname: opts.file.sourcePathname,
  });
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = source.getPageCount();

  if (totalPages <= pagesPerChunk) {
    return [opts.file];
  }

  const chunks: AnalysisFileInput[] = [];
  for (let start = 0; start < totalPages; start += pagesPerChunk) {
    const end = Math.min(start + pagesPerChunk, totalPages);
    const part = await PDFDocument.create();
    const pageIndexes = Array.from(
      { length: end - start },
      (_, offset) => start + offset,
    );
    const copied = await part.copyPages(source, pageIndexes);
    for (const page of copied) {
      part.addPage(page);
    }

    const partBytes = await part.save();
    const uploaded = await opts.client.files.create({
      file: await toFile(
        partBytes,
        `${opts.file.fileName.replace(/\.pdf$/i, "")}-p${start + 1}-${end}.pdf`,
        { type: "application/pdf" },
      ),
      purpose: "user_data",
    });

    chunks.push({
      fileUrl: `openai:${uploaded.id}`,
      fileName: `${opts.file.fileName} (صفحات ${start + 1}–${end})`,
    });
  }

  return chunks;
}

async function expandFilesForLargePdfs(opts: {
  client: OpenAI;
  files: AnalysisFileInput[];
  onProgress?: StageProgress;
}): Promise<AnalysisFileInput[]> {
  const expanded: AnalysisFileInput[] = [];
  for (const file of opts.files) {
    if (!isBlobSourcePathname(file.sourcePathname)) {
      expanded.push(file);
      continue;
    }

    try {
      const parts = await splitPdfIntoOpenAIChunks({
        client: opts.client,
        file,
      });
      if (parts.length > 1) {
        await opts.onProgress?.(
          16,
          `تقسيم ${file.fileName} إلى ${parts.length} أجزاء`,
        );
      }
      expanded.push(...parts);
    } catch {
      expanded.push(file);
    }
  }
  return expanded;
}

export async function analyzePdfWithOpenAI(input: {
  fileUrl?: string;
  fileName?: string;
  sourcePathname?: string;
  files?: AnalysisFileInput[];
  onProgress?: StageProgress;
}): Promise<AnalysisExtraction> {
  const files: AnalysisFileInput[] =
    input.files && input.files.length > 0
      ? input.files
      : input.fileUrl && input.fileName
        ? [
            {
              fileUrl: input.fileUrl,
              fileName: input.fileName,
              sourcePathname: input.sourcePathname,
            },
          ]
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

  // Proactively split very large PDFs from Blob before the first model call.
  const preparedFiles = await expandFilesForLargePdfs({
    client,
    files,
    onProgress: input.onProgress,
  });

  const runTogether = preparedFiles.length === files.length;

  try {
    if (!runTogether) {
      return await analyzeFilesChunked({
        client,
        model,
        files: preparedFiles,
        onProgress: input.onProgress,
      });
    }

    return await analyzeFilesTogether({
      client,
      model,
      files: preparedFiles,
      onProgress: input.onProgress,
    });
  } catch (error) {
    if (!isTokenBudgetError(error)) {
      throw error;
    }

    await input.onProgress?.(
      18,
      "الطلب أكبر من حد التوكنات — إعادة التقسيم بأجزاء أصغر",
    );

    try {
      const expanded: AnalysisFileInput[] = [];
      for (const file of files) {
        const parts = await splitPdfIntoOpenAIChunks({
          client,
          file,
          pagesPerChunk: PAGES_PER_ANALYSIS_CHUNK_RETRY,
        });
        expanded.push(...parts);
      }

      return await analyzeFilesChunked({
        client,
        model,
        files: expanded,
        onProgress: input.onProgress,
      });
    } catch (retryError) {
      if (
        isTokenBudgetError(retryError) ||
        (retryError instanceof Error &&
          /user_data|لا يمكن تقسيم|تعذر الوصول/i.test(retryError.message))
      ) {
        throw new Error(
          retryError instanceof Error &&
            /أعد رفع|لا يمكن تقسيم|تعذر الوصول/i.test(retryError.message)
            ? retryError.message
            : "تجاوز حد توكنات OpenAI (TPM). أعد رفع الملف في تحليل جديد، أو ارفع أجزاء أصغر (10 صفحات تقريباً)، أو ارفع حد الحساب من platform.openai.com/account/rate-limits، أو استخدم نموذجاً بحد أعلى.",
        );
      }
      throw retryError;
    }
  }
}
