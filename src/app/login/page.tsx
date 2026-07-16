import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "system_admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <LoginForm action={loginAction} />
    </div>
  );
}
