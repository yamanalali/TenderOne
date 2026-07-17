import { redirect } from "next/navigation";
import { countPendingPayments } from "@/app/actions/payments";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "system_admin") redirect("/dashboard");

  const pendingPaymentsCount = await countPendingPayments();

  return (
    <AppShell
      session={session}
      admin
      pendingPaymentsCount={pendingPaymentsCount}
    >
      {children}
    </AppShell>
  );
}
