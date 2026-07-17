"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { companies, companyMembers, users } from "@/lib/db/schema";
import { loginSchema, registerSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const data = parsed.data;
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return { error: "البريد الإلكتروني مستخدم مسبقاً" };
  }

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(data.password),
      phone: data.phone || null,
      role: "company_admin",
    })
    .returning();

  const [company] = await db
    .insert(companies)
    .values({
      nameAr: data.companyName,
      phone: data.phone || null,
      email: data.email.toLowerCase(),
    })
    .returning();

  await db.insert(companyMembers).values({
    companyId: company.id,
    userId: user.id,
    role: "company_admin",
  });

  await writeAuditLog({
    actorId: user.id,
    action: "register",
    entityType: "user",
    entityId: user.id,
    metadata: { companyId: company.id },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "بيانات الدخول غير صحيحة" };
  }

  if (!user.isActive) {
    return { error: "الحساب معطّل" };
  }

  await createSession(user.id);
  redirect(user.role === "system_admin" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
