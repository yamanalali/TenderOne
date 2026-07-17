"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  ChevronLeft,
  CircleDollarSign,
  Crown,
  FileSearch,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import type { AuthSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const clientNavigation: NavigationGroup[] = [
  {
    label: "الرئيسية",
    items: [
      {
        href: "/dashboard",
        label: "لوحة التحكم",
        description: "ملخص حسابك وخدماتك",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "المناقصات",
    items: [
      {
        href: "/tenders",
        label: "مركز المناقصات",
        description: "الفرص والمواعيد",
        icon: FileText,
      },
      {
        href: "/analyses",
        label: "تحليل دفتر الشروط",
        description: "استخرج مطلوباتك بدقة",
        icon: FileSearch,
      },
    ],
  },
  {
    label: "مستندات الشركة",
    items: [
      {
        href: "/templates",
        label: "مكتبة النماذج",
        description: "التصاميم وملف الشركة",
        icon: LibraryBig,
      },
      {
        href: "/documents",
        label: "مستنداتي",
        description: "المحرر والمعاينة",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "الحساب",
    items: [
      {
        href: "/my-services",
        label: "خدماتي ورصيدي",
        description: "الرصيد والخدمات المفعّلة وطلباتي",
        icon: ShieldCheck,
      },
      {
        href: "/payments",
        label: "شراء الخدمات",
        description: "الخدمات غير المشتراة",
        icon: WalletCards,
      },
      {
        href: "/settings",
        label: "إعدادات الشركة",
        description: "الشعار والبيانات",
        icon: SlidersHorizontal,
      },
    ],
  },
];

const adminNavigation: NavigationGroup[] = [
  {
    label: "مركز القيادة",
    items: [
      {
        href: "/admin",
        label: "نظرة عامة",
        description: "مؤشرات أداء المنصة",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/tenders",
        label: "إدارة المناقصات",
        description: "النشر والتحرير",
        icon: FolderKanban,
      },
      {
        href: "/admin/categories",
        label: "التصنيفات",
        description: "هيكلة المناقصات",
        icon: Tag,
      },
    ],
  },
  {
    label: "التشغيل التجاري",
    items: [
      {
        href: "/admin/payments",
        label: "مراجعة المدفوعات",
        description: "الموافقة والتفعيل",
        icon: CircleDollarSign,
      },
      {
        href: "/admin/products",
        label: "المنتجات والخدمات",
        description: "الأسعار والباقات",
        icon: Boxes,
      },
      {
        href: "/admin/settings",
        label: "إعدادات النظام",
        description: "الإعدادات العامة للمنصة",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "روابط سريعة",
    items: [
      {
        href: "/dashboard",
        label: "بوابة العملاء",
        description: "معاينة تجربة الشركة",
        icon: UserRound,
      },
    ],
  },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppShell({
  session,
  children,
  admin = false,
  pendingPaymentsCount = 0,
}: {
  session: AuthSession;
  children: React.ReactNode;
  admin?: boolean;
  pendingPaymentsCount?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = (admin ? adminNavigation : clientNavigation).map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === "/admin/payments" && pendingPaymentsCount > 0
        ? { ...item, badge: pendingPaymentsCount }
        : item,
    ),
  }));
  const identity = session.companyName || session.user.name;
  const initials = getInitials(identity);

  return (
    <div className="print-layout min-h-screen bg-[#f4f6fa]">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-hidden border-l border-white/8 bg-[#071426] text-white shadow-[0_0_60px_rgba(7,20,38,0.16)] lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-blue-700/10 blur-3xl" />

          <div className="relative flex h-20 shrink-0 items-center gap-3 border-b border-white/8 px-5">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 to-white/5 shadow-[0_0_28px_rgba(245,158,11,0.1)]">
              <ScanLine className="h-5 w-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black tracking-tight">TenderOne</p>
              <p className="truncate text-[9px] font-bold tracking-[0.2em] text-slate-500">
                {admin ? "ADMIN COMMAND CENTER" : "BUSINESS WORKSPACE"}
              </p>
            </div>
          </div>

          <div className="relative mx-3 mt-4 rounded-2xl border border-white/8 bg-gradient-to-l from-white/[0.07] to-white/[0.025] p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-yellow-600 text-sm font-black text-[#071426] shadow-lg shadow-amber-900/10">
                {initials}
                <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#0d1a2c] bg-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-black text-white">
                    {identity}
                  </p>
                  {admin && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
                </div>
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                  {admin ? "مدير النظام الرئيسي" : "مساحة شركة خاصة وآمنة"}
                </p>
              </div>
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-600" />
            </div>
          </div>

          <nav className="relative mt-4 flex-1 overflow-y-auto px-3 pb-24 sidebar-scroll">
            {groups.map((group, groupIndex) => (
              <div
                key={group.label}
                className={cn(groupIndex > 0 && "mt-4 border-t border-white/6 pt-4")}
              >
                <p className="mb-1.5 px-3 text-[10px] font-bold text-slate-500">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isLinkActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 transition duration-200",
                          active
                            ? "bg-gradient-to-l from-amber-300/15 via-amber-300/[0.07] to-transparent text-white ring-1 ring-amber-300/10"
                            : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200",
                        )}
                      >
                        {active && (
                          <span className="absolute -right-4 h-8 w-1 rounded-l-full bg-gradient-to-b from-amber-200 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.45)]" />
                        )}
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition",
                            active
                              ? "border-amber-300/20 bg-amber-300 text-[#071426] shadow-[0_7px_20px_rgba(245,158,11,0.16)]"
                              : "border-white/6 bg-white/[0.035] group-hover:border-white/10 group-hover:text-amber-300",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="block truncate text-sm font-bold">
                              {item.label}
                            </span>
                            {item.badge ? (
                              <span className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-[#071426]">
                                {item.badge}
                              </span>
                            ) : null}
                        </span>
                        <ChevronLeft
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition",
                            active
                              ? "text-amber-300"
                              : "translate-x-1 text-slate-700 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-white/8 bg-[#071426]/95 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                <UserRound className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-300">
                  {session.user.name}
                </p>
                <p className="mt-0.5 truncate text-[9px] text-slate-600">
                  {session.user.email}
                </p>
              </div>
              <form
                action={logoutAction}
                onSubmit={(e) => {
                  if (!confirm("هل تريد تسجيل الخروج؟")) e.preventDefault();
                }}
              >
                <button
                  type="submit"
                  title="تسجيل الخروج"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.035] text-slate-500 transition hover:border-rose-400/20 hover:bg-rose-400/10 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="no-print mb-4 overflow-hidden rounded-2xl bg-[#071426] text-white shadow-lg lg:hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300 text-xs font-black text-[#071426]">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-black">TenderOne</p>
                  <p className="text-[10px] text-slate-500">{identity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-200"
                  aria-label="القائمة"
                >
                  {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
                <form
                  action={logoutAction}
                  onSubmit={(e) => {
                    if (!confirm("هل تريد تسجيل الخروج؟")) e.preventDefault();
                  }}
                >
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>

            {mobileOpen && (
              <div className="space-y-4 border-t border-white/8 px-4 py-4">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-[10px] font-black tracking-wide text-slate-500">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isLinkActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold",
                              active
                                ? "bg-amber-300/15 text-amber-200"
                                : "text-slate-300 hover:bg-white/5",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge ? (
                              <span className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-[#071426]">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
