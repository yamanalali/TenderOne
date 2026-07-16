import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

export type AppSettings = {
  endingSoonDays: number;
  newTenderDays: number;
  bankName: string;
  bankAccountName: string;
  bankIban: string;
  maxUploadMb: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  endingSoonDays: 7,
  newTenderDays: 3,
  bankName: "مصرف تجريبي",
  bankAccountName: "TenderOne",
  bankIban: "SA00 0000 0000 0000 0000 0000",
  maxUploadMb: 50,
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const rows = await db.select().from(systemSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      endingSoonDays: Number(map.endingSoonDays ?? DEFAULT_SETTINGS.endingSoonDays),
      newTenderDays: Number(map.newTenderDays ?? DEFAULT_SETTINGS.newTenderDays),
      bankName: String(map.bankName ?? DEFAULT_SETTINGS.bankName),
      bankAccountName: String(
        map.bankAccountName ?? DEFAULT_SETTINGS.bankAccountName,
      ),
      bankIban: String(map.bankIban ?? DEFAULT_SETTINGS.bankIban),
      maxUploadMb: Number(map.maxUploadMb ?? DEFAULT_SETTINGS.maxUploadMb),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function upsertSetting(key: string, value: unknown) {
  const existing = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  if (existing[0]) {
    await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key));
  } else {
    await db.insert(systemSettings).values({ key, value });
  }
}

export async function saveGlobalOpenAIConfig(apiKey: string, model: string) {
  if (apiKey.trim()) {
    await upsertSetting("openaiApiKeyEncrypted", encryptSecret(apiKey.trim()));
  }
  await upsertSetting("openaiModel", model.trim() || "gpt-4o");
}

export async function getGlobalOpenAIConfig() {
  let apiKey = process.env.OPENAI_API_KEY || "";
  let model = process.env.OPENAI_MODEL || "gpt-4o";
  let configuredInAdmin = false;

  try {
    const rows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "openaiApiKeyEncrypted"))
      .limit(1);
    const modelRows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "openaiModel"))
      .limit(1);

    if (typeof rows[0]?.value === "string") {
      apiKey = decryptSecret(rows[0].value);
      configuredInAdmin = true;
    }
    if (typeof modelRows[0]?.value === "string") {
      model = modelRows[0].value;
    }
  } catch {
    // Environment variables remain the secure fallback.
  }

  return { apiKey, model, configuredInAdmin };
}
