import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { marketingNav } from "@/lib/marketing";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/8">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <p className="text-xl font-black text-white">TenderOne</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
            منصة مؤسسية لتجهيز ملفات المناقصات وتحليل دفاتر الشروط وتنظيم
            المطلوبات — دون الدخول في عملية التقديم نفسها.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-400 transition hover:text-amber-300"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-400 transition hover:text-amber-300"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-slate-400 transition hover:text-amber-300"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-slate-600 sm:flex-row lg:px-8">
          <p>© 2026 TenderOne. Procurement Intelligence Platform.</p>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5" />
            بنية آمنة متعددة الشركات
          </div>
        </div>
      </div>
    </footer>
  );
}
