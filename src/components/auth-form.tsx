"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function Field({
  id,
  name,
  label,
  type = "text",
  icon: Icon,
  required,
  dir,
  autoComplete,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  dir?: "rtl" | "ltr";
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[13px] font-bold text-slate-700">
        {label}
        {required && <span className="ms-1 text-amber-600">*</span>}
      </Label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute end-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-700" />
        <Input
          id={id}
          name={name}
          type={type}
          required={required}
          dir={dir}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            "h-12 rounded-2xl border-slate-200 bg-slate-50/70 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10",
            // The icon sits on the page's inline-end (left in RTL). Logical
            // padding resolves against the input's own dir, so LTR inputs
            // need ps-11 (left) while RTL inputs need pe-11 (left too).
            dir === "ltr" ? "ps-11 text-left" : "pe-11",
          )}
        />
      </div>
    </div>
  );
}

function PasswordField({
  id = "password",
  name = "password",
  label = "كلمة المرور",
  minLength,
  autoComplete = "current-password",
}: {
  id?: string;
  name?: string;
  label?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[13px] font-bold text-slate-700">
        {label}
        <span className="ms-1 text-amber-600">*</span>
      </Label>
      <div className="group relative">
        <LockKeyhole className="pointer-events-none absolute end-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-700" />
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 pe-11 ps-12 text-left shadow-none transition hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute start-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function AuthShell({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06101f] px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="absolute -end-32 -top-32 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -start-24 h-[28rem] w-[28rem] rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_40px_120px_rgba(0,0,0,0.38)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden min-h-[660px] overflow-hidden bg-[#0a1b30] p-10 text-white lg:flex lg:flex-col xl:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.19),transparent_30%),radial-gradient(circle_at_20%_90%,rgba(13,148,136,0.18),transparent_34%)]" />
            <div className="pointer-events-none absolute -end-12 top-36 h-52 w-52 rotate-12 rounded-[3rem] border border-white/5" />
            <div className="pointer-events-none absolute -end-2 top-48 h-36 w-36 rotate-12 rounded-[2.5rem] border border-amber-300/10" />

            <Link href="/" className="relative flex w-fit items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-white/10 shadow-[0_0_32px_rgba(245,158,11,0.12)]">
                <ScanLine className="h-5 w-5 text-amber-300" />
              </span>
              <span>
                <span className="block text-xl font-black tracking-tight">TenderOne</span>
                <span className="block text-[9px] font-bold tracking-[0.22em] text-slate-500">
                  PROCUREMENT INTELLIGENCE
                </span>
              </span>
            </Link>

            <div className="relative my-auto py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                منصة أعمال متكاملة للمناقصات
              </span>
              <h1 className="mt-6 max-w-md text-4xl font-black leading-[1.35] xl:text-[2.7rem]">
                من دفتر الشروط إلى عرض احترافي
                <span className="text-amber-300"> بثقة أكبر.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-8 text-slate-400">
                حلّل المناقصات، نظّم المطلوبات، وأنشئ مستندات شركتك في مساحة عمل
                واحدة وآمنة.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  "بيانات كل شركة معزولة ومحمية",
                  "ادفع فقط مقابل الخدمات التي تحتاجها",
                  "نماذج ومستندات احترافية جاهزة",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-teal-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-500">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              اتصال آمن وخصوصية كاملة لبيانات شركتك
            </div>
          </section>

          <section className="relative flex min-h-[660px] items-center bg-white px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto w-full max-w-md">
              <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1b30]">
                  <ScanLine className="h-5 w-5 text-amber-300" />
                </span>
                <span className="text-xl font-black text-[#0a1b30]">TenderOne</span>
              </Link>

              <p className="text-xs font-black tracking-wide text-teal-700">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071426] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
              <div className="mt-7">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function LoginForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <AuthShell
      title="تسجيل الدخول"
      description="مرحباً بعودتك، أدخل بياناتك للوصول إلى مساحة عمل شركتك."
      eyebrow="مرحباً بعودتك"
    >
      <form action={formAction} className="space-y-5">
        <Field
          id="email"
          name="email"
          label="البريد الإلكتروني"
          type="email"
          icon={Mail}
          required
          dir="ltr"
          autoComplete="email"
          placeholder="name@company.com"
        />
        <PasswordField />
        <div className="flex items-center justify-end">
          <Link href="/contact" className="text-xs font-bold text-teal-700 transition hover:text-teal-900">
            هل نسيت كلمة المرور؟
          </Link>
        </div>
        {state.error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-[#0b766e] font-black shadow-[0_12px_28px_rgba(13,148,136,0.2)] hover:bg-[#095f59]"
          disabled={pending}
        >
          {pending ? "جاري الدخول..." : "تسجيل الدخول"}
          {!pending && <ArrowLeft className="h-4 w-4" />}
        </Button>
      </form>
      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] text-slate-400">جديد في TenderOne؟</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <p className="text-center text-sm text-slate-600">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-black text-amber-700 transition hover:text-amber-800">
          إنشاء حساب شركة
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <AuthShell
      title="إنشاء حساب شركة"
      description="أنشئ مساحة عمل شركتك خلال دقيقة وابدأ بالخدمات التي تحتاجها."
      eyebrow="ابدأ رحلتك مع TenderOne"
    >
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="name"
            name="name"
            label="اسم المسؤول"
            icon={UserRound}
            required
            autoComplete="name"
            placeholder="الاسم الكامل"
          />
          <Field
            id="companyName"
            name="companyName"
            label="اسم الشركة"
            icon={Building2}
            required
            autoComplete="organization"
            placeholder="اسم المنشأة"
          />
        </div>
        <Field
          id="email"
          name="email"
          label="البريد الإلكتروني"
          type="email"
          icon={Mail}
          required
          dir="ltr"
          autoComplete="email"
          placeholder="name@company.com"
        />
        <Field
          id="phone"
          name="phone"
          label="رقم الهاتف"
          type="tel"
          icon={Phone}
          dir="ltr"
          autoComplete="tel"
          placeholder="+966 5X XXX XXXX"
        />
        <PasswordField minLength={8} autoComplete="new-password" />
        <p className="-mt-1 text-[11px] leading-5 text-slate-400">
          استخدم 8 أحرف على الأقل لحماية حسابك.
        </p>
        {state.error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-[#0b766e] font-black shadow-[0_12px_28px_rgba(13,148,136,0.2)] hover:bg-[#095f59]"
          disabled={pending}
        >
          {pending ? "جاري إنشاء الحساب..." : "إنشاء حساب الشركة"}
          {!pending && <ArrowLeft className="h-4 w-4" />}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        لديك حساب؟{" "}
        <Link href="/login" className="font-black text-amber-700 transition hover:text-amber-800">
          تسجيل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
