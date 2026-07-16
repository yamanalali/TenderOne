import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  companies,
  companyMembers,
  sessions,
  users,
  type User,
} from "@/lib/db/schema";
export { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "tp_session";
const SESSION_DAYS = 14;

export type AuthSession = {
  user: User;
  companyId: string | null;
  companyName: string | null;
  membershipRole: User["role"] | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      user: users,
      companyId: companyMembers.companyId,
      companyName: companies.nameAr,
      membershipRole: companyMembers.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(companyMembers, eq(companyMembers.userId, users.id))
    .leftJoin(companies, eq(companies.id, companyMembers.companyId))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.isActive, true),
      ),
    )
    .limit(1);

  if (!row) return null;

  return {
    user: row.user,
    companyId: row.companyId,
    companyName: row.companyName,
    membershipRole: row.membershipRole,
  };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireSystemAdmin() {
  const session = await requireSession();
  if (session.user.role !== "system_admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireCompanySession() {
  const session = await requireSession();
  if (!session.companyId && session.user.role !== "system_admin") {
    throw new Error("NO_COMPANY");
  }
  return session;
}
