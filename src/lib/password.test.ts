import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password", () => {
  it("verifies the correct password", async () => {
    const hash = await hashPassword("correct-horse");
    assert.equal(await verifyPassword("correct-horse", hash), true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("correct-horse");
    assert.equal(await verifyPassword("wrong-password", hash), false);
  });

  it("does not store plaintext and salts differently", async () => {
    const password = "same-password";
    const hashA = await hashPassword(password);
    const hashB = await hashPassword(password);
    assert.notEqual(hashA, password);
    assert.notEqual(hashB, password);
    assert.notEqual(hashA, hashB);
  });
});
