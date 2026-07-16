import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { RegisterForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <RegisterForm action={registerAction} />
    </div>
  );
}
