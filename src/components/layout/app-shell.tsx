import Link from "next/link";
import {
  Building2,
  FileSearch,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
  Wallet,
} from "lucide-react";
import type { AuthSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const portalLinks = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/tenders", label: "المناقصات", icon: FileText },
  { href: "/analyses", label: "تحليل دفتر الشروط", icon: FileSearch },
  { href: "/company-profile", label: "ملف الشركة", icon: Building2 },
  { href: "/templates", label: "مكتبة النماذج", icon: Package },
  { href: "/payments", label: "الدفع", icon: Wallet },
];

export function AppShell({
  session,
  children,
  admin = false,
}: {
  session: AuthSession;
  children: React.ReactNode;
  admin?: boolean;
}) {
  const links = admin
    ? [
        { href: "/admin", label: "نظرة عامة", icon: Shield },
        { href: "/admin/tenders", label: "المناقصات", icon: FileText },
        { href: "/admin/categories", label: "التصنيفات", icon: Package },
        { href: "/admin/payments", label: "المدفوعات", icon: Wallet },
        { href: "/admin/products", label: "المنتجات", icon: Package },
        { href: "/admin/settings", label: "الإعدادات", icon: Settings },
        { href: "/dashboard", label: "بوابة العملاء", icon: LayoutDashboard },
      ]
    : portalLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-l border-slate-200 bg-white p-5 md:block">
          <div className="mb-8">
            <p className="text-sm font-black tracking-wide text-teal-700">
              TenderOne
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-900">
              {admin ? "لوحة الإدارة" : "بوابة الشركات"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {session.companyName || session.user.name}
            </p>
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction} className="mt-8">
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 md:hidden">
            <div>
              <p className="text-sm font-bold">{session.user.name}</p>
              <p className="text-xs text-slate-500">{session.companyName}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" size="sm" variant="outline">
                خروج
              </Button>
            </form>
          </div>
          <div className="mb-4 flex flex-wrap gap-2 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
