import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AuthSession } from "@/lib/auth";
import type { User } from "@/lib/db/schema";
import { assertCompanyAccess, isSystemAdmin } from "@/lib/permissions";

function makeSession(
  overrides: Partial<AuthSession> & { role?: User["role"] } = {},
): AuthSession {
  const role = overrides.role ?? overrides.user?.role ?? "user";
  const user = {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Test User",
    email: "user@example.com",
    passwordHash: "hash",
    role,
    phone: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides.user,
  } as User;

  return {
    user,
    companyId: overrides.companyId ?? "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    companyName: overrides.companyName ?? "شركة الاختبار",
    membershipRole: overrides.membershipRole ?? role,
  };
}

describe("isSystemAdmin", () => {
  it("returns true for system_admin", () => {
    assert.equal(isSystemAdmin(makeSession({ role: "system_admin" })), true);
  });

  it("returns false for company users", () => {
    assert.equal(isSystemAdmin(makeSession({ role: "user" })), false);
    assert.equal(isSystemAdmin(makeSession({ role: "company_admin" })), false);
  });
});

describe("assertCompanyAccess", () => {
  it("allows system admin for any company", () => {
    assert.doesNotThrow(() =>
      assertCompanyAccess(
        makeSession({ role: "system_admin", companyId: null }),
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      ),
    );
  });

  it("allows matching companyId", () => {
    const companyId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    assert.doesNotThrow(() =>
      assertCompanyAccess(makeSession({ companyId }), companyId),
    );
  });

  it("throws FORBIDDEN for mismatched companyId", () => {
    assert.throws(
      () =>
        assertCompanyAccess(
          makeSession({ companyId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }),
          "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        ),
      /FORBIDDEN/,
    );
  });

  it("throws FORBIDDEN for null companyId", () => {
    assert.throws(
      () =>
        assertCompanyAccess(
          makeSession({ companyId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }),
          null,
        ),
      /FORBIDDEN/,
    );
  });
});
