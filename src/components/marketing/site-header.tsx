"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, ScanLine, X } from "lucide-react";
import { useState } from "react";
import { marketingNav } from "@/lib/marketing";
import { cn } from "@/lib/utils";

export function SiteHeader({
  isLoggedIn,
  destination,
}: {
  isLoggedIn: boolean;
  destination: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-white/8 bg-[#06101f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/20 bg-white/10 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300/30 to-yellow-600/10 opacity-0 transition group-hover:opacity-100" />
            <ScanLine className="relative h-5 w-5 text-amber-300" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-white">
              TenderOne
            </p>
            <p className="text-[10px] font-bold tracking-[0.24em] text-slate-500">
              PROCUREMENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-400 lg:flex">
          {marketingNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition hover:text-white",
                  active && "text-amber-300",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href={destination}
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-amber-300 to-yellow-500 px-5 text-sm font-black text-[#091426] transition hover:brightness-110"
            >
              لوحة التحكم
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-11 items-center rounded-xl px-4 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-amber-300 to-yellow-500 px-5 text-sm font-black text-[#091426] transition hover:brightness-110"
              >
                ابدأ الآن
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/8 px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
