import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { marketingPriceList } from "@/lib/marketing";

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="الأسعار"
        title="قائمة الأسعار الأساسية — الإصدار الأول"
        description="أسعار واضحة بالدولار الأمريكي. بعض الخدمات لها نطاق حسب الحجم والتعقيد، ويمكن الاتفاق قبل التحويل."
      />

      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-black text-amber-300">الخدمات الأساسية</p>
          <h2 className="mt-2 text-3xl font-black">ما تحتاجه لتجهيز عرضك</h2>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.035]">
          {marketingPriceList.core.map((item, index) => (
            <div
              key={item.name}
              className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                index > 0 ? "border-t border-white/8" : ""
              }`}
            >
              <p className="font-bold text-white">{item.name}</p>
              <p className="shrink-0 text-sm font-black text-amber-300">
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-black text-amber-300">خدمات إضافية</p>
            <h2 className="mt-2 text-3xl font-black">أسعار ثابتة وواضحة</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {marketingPriceList.addons.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-white/8 bg-white/[0.035] p-5"
              >
                <p className="font-bold text-white">{item.name}</p>
                <p className="mt-3 text-sm font-black text-amber-300">
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-black text-amber-300">
            <Sparkles className="h-4 w-4" />
            باقات التحليل
          </div>
          <h2 className="text-3xl font-black">اختر عدد التحليلات المناسب</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            باقات من تحليل واحد حتى أربعة. بعد التحويل يراجع الأدمن الطلب ويفعّل
            الرصيد حسب الباقة المختارة.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketingPriceList.packages.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-5 text-center"
            >
              <p className="font-black text-white">{item.name}</p>
              <p className="mt-3 text-xs font-bold text-amber-200">
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-200/15 bg-gradient-to-l from-amber-400/15 via-blue-950/25 to-yellow-700/10 px-6 py-14 text-center md:px-14 md:py-16">
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
              لست متأكداً من الخدمة المناسبة؟
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              تواصل معنا، وسنساعدك في اختيار الخدمة الأنسب لاحتياجك.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-500 px-8 text-sm font-black text-[#091426] transition hover:brightness-110"
              >
                تواصل معنا
                <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-14 items-center rounded-2xl border border-white/15 bg-white/5 px-8 text-sm font-black text-white transition hover:bg-white/10"
              >
                ابدأ الآن
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500">
              {[
                "أسعار واضحة بالدولار",
                "الدفع بعد الاتفاق عند الحاجة",
                "تفعيل بعد موافقة الإدارة",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
