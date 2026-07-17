import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

describe("secrets", () => {
  const previousSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests";
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = previousSecret;
    }
  });

  it("round-trips plaintext including Arabic", () => {
    const value = "مفتاح-OpenAI-سري-123!";
    assert.equal(decryptSecret(encryptSecret(value)), value);
  });

  it("produces different ciphertexts for the same value", () => {
    const value = "same-secret";
    assert.notEqual(encryptSecret(value), encryptSecret(value));
  });

  it("throws on malformed payload", () => {
    assert.throws(() => decryptSecret("not-valid"), /Invalid encrypted secret/);
    assert.throws(() => decryptSecret("only.two"), /Invalid encrypted secret/);
  });

  it("throws when ciphertext is tampered", () => {
    const encrypted = encryptSecret("sensitive");
    const [iv, tag, data] = encrypted.split(".");
    const buf = Buffer.from(data!, "base64");
    buf[0] = buf[0]! ^ 0xff;
    const tampered = `${iv}.${tag}.${buf.toString("base64")}`;
    assert.throws(() => decryptSecret(tampered));
  });

  it("throws when AUTH_SECRET is missing", () => {
    delete process.env.AUTH_SECRET;
    assert.throws(() => encryptSecret("x"), /AUTH_SECRET is required/);
  });
});
