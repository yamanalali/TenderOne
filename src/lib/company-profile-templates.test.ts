import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROFILE_TEMPLATES,
  getProfileTemplate,
} from "@/lib/company-profile-templates";

describe("getProfileTemplate", () => {
  it("returns a known template by key", () => {
    const key = PROFILE_TEMPLATES[0]!.key;
    const template = getProfileTemplate(key);
    assert.equal(template.key, key);
  });

  it("maps legacy keys via style fallback", () => {
    const modern = getProfileTemplate("modern");
    assert.equal(modern.style, "modern");

    const premium = getProfileTemplate("corporate");
    assert.equal(premium.style, "premium");
  });

  it("falls back for unknown keys", () => {
    const template = getProfileTemplate("does-not-exist");
    assert.equal(template.key, PROFILE_TEMPLATES[0]!.key);
  });
});
