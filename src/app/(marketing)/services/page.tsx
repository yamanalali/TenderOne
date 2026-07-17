import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { marketingServices } from "@/lib/marketing";

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="الخدمات"
        title="خدمات مستقلة تخدم شركات مختلفة باحتياجات مختلفة"
        description="استخدم تحليل دفتر الشروط وحده، أو ملف الشركة، أو النماذج، أو اجمعها معاً. لا يوجد التزام باستخدام المنظومة كاملة."
      />

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="grid gap-5">
          {marketingServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.slug}
                className="service-card group relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-6 transition hover:border-amber-300/25 md:p-8"
              >
                <div
                  className={`absolute inset-y-0 right-0 w-1 bg-gradient-to-b ${service.accent} opacity-70`}
                />
                <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
                    <Icon className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black tracking-widest text-slate-600">
                        {service.number}
                      </span>
                      <h2 className="text-2xl font-black">{service.title}</h2>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {service.desc}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {service.details}
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 text-sm font-black text-amber-300 ring-1 ring-white/10 transition hover:bg-amber-300 hover:text-[#091426]"
                  >
                    ابدأ الخدمة
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
