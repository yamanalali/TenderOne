import OpenAI from "openai";
import {
  analysisExtractionSchema,
  type AnalysisExtraction,
} from "@/lib/analysis/types";
import { getGlobalOpenAIConfig } from "@/lib/settings";

const SYSTEM_PROMPT = `أنت محلل خبير لدفاتر شروط المناقصات باللغة العربية.
استخرج المعلومات بدقة من ملف PDF، وأرجع JSON فقط حسب المخطط المطلوب.
لكل بند مطلوب أدرج رقم الصفحة إن أمكن.
إذا لم تجد معلومة ضع null أو مصفوفة فارغة.
لا تختلق بيانات غير موجودة في الملف.`;

function demoExtraction(fileName: string): AnalysisExtraction {
  return {
    tenderInfo: {
      agency: "جهة غير محددة (وضع تجريبي)",
      referenceNumber: "DEMO-001",
      deadline: null,
      executionDuration: "غير محددة",
      guarantees: "كفالة ابتدائية حسب دفتر الشروط",
      currency: "SAR",
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
      {
        title: "تفويض رسمي",
        details: "مصدق",
        pageNumber: 2,
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
    staff: [
      {
        title: "مدير مشروع",
        details: "خبرة لا تقل عن 5 سنوات",
        pageNumber: 4,
        required: true,
      },
    ],
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

export async function analyzePdfWithOpenAI(input: {
  fileUrl: string;
  fileName: string;
}): Promise<AnalysisExtraction> {
  const config = await getGlobalOpenAIConfig();
  if (!config.apiKey || input.fileUrl.startsWith("blob:")) {
    return demoExtraction(input.fileName);
  }

  const client = new OpenAI({ apiKey: config.apiKey });
  const model = config.model;

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "حلل دفتر الشروط واستخرج المطلوبات والمعلومات حسب المخطط.",
          },
          {
            type: "input_file",
            file_url: input.fileUrl,
          } as never,
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "tender_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            tenderInfo: {
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
            },
            submissionMethod: {
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
            },
            documents: { type: "array", items: itemSchema() },
            experience: { type: "array", items: itemSchema() },
            staff: { type: "array", items: itemSchema() },
            equipment: { type: "array", items: itemSchema() },
            samples: { type: "array", items: itemSchema() },
            certificates: { type: "array", items: itemSchema() },
            guarantees: { type: "array", items: itemSchema() },
            rejectionRisks: { type: "array", items: itemSchema() },
            specialConditions: { type: "array", items: itemSchema() },
            confidence: { type: "number" },
            summary: { type: ["string", "null"] },
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
            "confidence",
            "summary",
          ],
        },
      },
    },
  });

  const text = response.output_text;
  const parsed = JSON.parse(text);
  return analysisExtractionSchema.parse(parsed);
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
