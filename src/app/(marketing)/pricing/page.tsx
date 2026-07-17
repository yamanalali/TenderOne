import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  Gem,
  HandCoins,
  Layers3,
  MessageSquare,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { marketingServices } from "@/lib/marketing";

const pricingPrinciples = [
  {
    icon: HandCoins,
    title: "أسعار خفيفة على المستخدم",
    desc: "لا اشتراكات ثقيلة ولا التزامات طويلة. تدفع فقط مقابل الخدمة التي تحتاجها فعلاً.",
  },
  {
    icon: Layers3,
    title: "كل خدمة لها تسعير مستقل",
    desc: "تسعير تحليل دفتر الشروط يختلف عن ملف الشركة، ويختلف عن النماذج — حسب حجم واحتياج كل شركة.",
  },
  {
    icon: BadgePercent,
    title: "حسومات حقيقية",
    desc: "خصومات على الباقات المتعددة، العملاء الجدد، والشركات التي تفعّل أكثر من خدمة معاً.",
  },
  {
    icon: Gem,
    title: "عروض حسب الطلب",
    desc: "أخبرنا باحتياجك ونجهّز لك عرضاً مخصصاً يناسب حجم أعمالك وميزانيتك.",
  },
];

const discounts = [
  {
    value: "حتى 25%",
    title: "حسم الباقات",
    desc: "كلما زاد عدد التحليلات أو النماذج المطلوبة، انخفض سعر الوحدة.",
  },
  {
    value: "حسم خاص",
    title: "العملاء الجدد",
    desc: "خصم ترحيبي على أول خدمة تقوم بتفعيلها داخل المنصة.",
  },
  {
    value: "عرض مجمّع",
    title: "أكثر من خدمة",
    desc: "فعّل خدمتين أو أكثر واحصل على تسعير مجمّع أوفر بكثير من التفعيل المنفرد.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="الأسعار"
        title="تسعير مرن حسب الطلب — بدون أسعار ثابتة مرهقة"
        description="فلسفتنا بسيطة: كل شركة تختلف عن غيرها، لذلك كل خدمة تُسعّر بشكل مستقل وحسب احتياجك، مع حسومات واضحة على الباقات والخدمات المجمعة."
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {pricingPrinciples.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-7 transition hover:border-amber-300/25"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 ring-1 ring-amber-300/20">
                  <Icon className="h-5 w-5 text-amber-300" />
                </div>
                <h2 className="mt-6 text-xl font-black">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-10 flex items-center gap-2 text-xs font-black text-amber-300">
            <TrendingDown className="h-4 w-4" />
            الحسومات المتاحة
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {discounts.map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-gradient-to-b from-amber-300/10 to-transparent p-7"
              >
                <p className="text-3xl font-black text-amber-300">
                  {item.value}
                </p>
                <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-black text-amber-300">
            <Sparkles className="h-4 w-4" />
            تسعير كل خدمة على حدة
          </div>
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            كل خدمة مستقلة… وتسعيرها مستقل أيضاً
          </h2>
          <p className="mt-4 text-slate-400">
            اختر الخدمة، أخبرنا بحجم احتياجك، واحصل على عرض سعر مناسب لك.
          </p>
        </div>

        <div className="grid gap-4">
          {marketingServices.slice(0, 5).map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.slug}
                className="group relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-6 transition hover:border-amber-300/25"
              >
                <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
                    <Icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{service.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{service.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-4 py-2 text-xs font-black text-amber-200">
                      حسب الطلب
                    </span>
                    <Link
                      href="/contact"
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/5 px-4 text-xs font-black text-white ring-1 ring-white/10 transition hover:bg-amber-300 hover:text-[#091426]"
                    >
                      اطلب عرض سعر
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-200/15 bg-gradient-to-l from-amber-400/15 via-blue-950/25 to-yellow-700/10 px-6 py-14 text-center md:px-14 md:py-16">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
              أخبرنا باحتياجك، ودعنا نجهّز لك أفضل عرض
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              عدد التحليلات، حجم الشركة، الخدمات المطلوبة — وسنعود إليك بعرض
              مخصص مع الحسومات المتاحة.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-500 px-8 text-sm font-black text-[#091426] transition hover:brightness-110"
              >
                اطلب عرض سعر مخصص
                <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-14 items-center rounded-2xl border border-white/15 bg-white/5 px-8 text-sm font-black text-white transition hover:bg-white/10"
              >
                إنشاء حساب مجاني
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500">
              {[
                "إنشاء الحساب مجاني بالكامل",
                "الدفع فقط عند تفعيل خدمة",
                "لا رسوم خفية",
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
