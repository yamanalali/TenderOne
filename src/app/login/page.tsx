import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "system_admin" ? "/admin" : "/dashboard");
  }

  return <LoginForm action={loginAction} />;
}
