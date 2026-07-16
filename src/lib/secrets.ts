import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function encryptionKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to encrypt secrets");
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string) {
  const [ivValue, tagValue, encryptedValue] = payload.split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid encrypted secret");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
