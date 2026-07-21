import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileText,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  marketingServices,
  marketingStats,
} from "@/lib/marketing";

export default async function HomePage() {
  const session = await getSession();
  const destination =
    session?.user.role === "system_admin" ? "/admin" : "/dashboard";

  return (
    <>
      <section className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
        <div className="relative">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/8 px-4 py-2 text-xs font-bold text-amber-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            منصة تجهيز ملفات المناقصات
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.15] tracking-[-0.03em] md:text-6xl">
            قدّم عرضك بثقة، والتزم بمتطلبات المناقصة بدقة.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl">
            نوفر لك خبرة احترافية في تحليل دفاتر الشروط، تجهيز المستندات، وتوفير
            الوقت والجهد لتزيد فرص نجاحك.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={session ? destination : "/register"}
              className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-500 px-7 text-sm font-black text-[#091426] shadow-[0_0_45px_rgba(245,158,11,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(245,158,11,0.3)]"
            >
              ابدأ الآن
              <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur transition hover:border-white/25 hover:bg-white/10"
            >
              تواصل معنا
              <FileText className="h-4 w-4 text-slate-400" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-slate-500">
            {["بدون التزام طويل", "خدمات مستقلة", "بيانات معزولة وآمنة"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-amber-500/15 via-blue-900/15 to-yellow-700/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/15 bg-[#091426]/90 p-3 shadow-[0_45px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <LockKeyhole className="h-3 w-3" />
                SECURE COMMAND CENTER
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">ملخص العمليات</p>
                  <h2 className="mt-1 text-xl font-black">صباح الإنجاز</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 ring-1 ring-amber-300/20">
                  <BarChart3 className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  ["24", "مناقصة نشطة", "+8%"],
                  ["06", "تحليلات جاهزة", "جديد"],
                  ["11", "ملف مكتمل", "92%"],
                ].map(([value, label, meta]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/8 bg-white/[0.035] p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black">{value}</p>
                      <span className="text-[9px] font-bold text-amber-300">
                        {meta}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">جاهزية ملف العرض</p>
                  <p className="text-xs font-black text-amber-300">84%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-l from-amber-300 to-yellow-600 shadow-[0_0_14px_rgba(245,158,11,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="float-slow absolute -left-5 top-24 hidden rounded-2xl border border-white/10 bg-[#111827]/90 p-3 shadow-2xl backdrop-blur-xl sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
                <Zap className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">تحليل دفتر الشروط</p>
                <p className="text-xs font-black">اكتمل بنجاح</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-x-reverse divide-white/8 px-5 py-8 lg:px-8">
          {marketingStats.map((stat) => (
            <div key={stat.label} className="px-4 text-center">
              <p className="text-2xl font-black text-white md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500 md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-black text-amber-300">
              <Layers3 className="h-4 w-4" />
              منظومة واحدة. سيطرة كاملة.
            </div>
            <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
              كل ما تحتاجه قبل لحظة التقديم
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-black text-amber-300"
          >
            عرض كل الخدمات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketingServices.slice(0, 3).map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                href="/services"
                className="service-card group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] p-6 transition duration-500 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${service.accent} opacity-0 transition group-hover:opacity-100`}
                />
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-slate-700">
                    {service.number}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {service.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-200/15 bg-gradient-to-l from-amber-400/15 via-blue-950/25 to-yellow-700/10 px-6 py-14 text-center md:px-14 md:py-20">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
              حوّل إدارة المناقصات إلى ميزة تنافسية
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              تصفّح الأسعار، تعرّف على الخدمات، وابدأ بما تحتاجه فقط.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex h-14 items-center rounded-2xl border border-white/15 bg-white/5 px-8 text-sm font-black text-white transition hover:bg-white/10"
              >
                عرض الأسعار
              </Link>
              <Link
                href={session ? destination : "/register"}
                className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-500 px-8 text-sm font-black text-[#091426] transition hover:brightness-110"
              >
                ابدأ الآن
                <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
