import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { RegisterForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "system_admin" ? "/admin" : "/dashboard");
  }

  return <RegisterForm action={registerAction} />;
}