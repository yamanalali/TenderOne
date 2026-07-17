import { Building2, ShieldCheck, Target, Users } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";

const pillars = [
  {
    title: "تركيز على التجهيز",
    desc: "المنصة لا تتدخل في التقديم نفسه. مهمتها تحليل دفتر الشروط وتنظيم المطلوبات وتجهيز الملفات.",
    icon: Target,
  },
  {
    title: "خدمات مستقلة",
    desc: "كل خدمة تعمل وحدها. الشركة تختار ما تحتاجه فقط وتتوسع لاحقاً بلا إعادة بناء.",
    icon: Building2,
  },
  {
    title: "أمان متعدد الشركات",
    desc: "بيانات كل شركة معزولة، مع أدوار وصلاحيات وسجل تدقيق للإجراءات الحساسة.",
    icon: ShieldCheck,
  },
  {
    title: "مصمم لفرق الأعمال",
    desc: "واجهة عربية واضحة تناسب فرق المناقصات والمشتريات والمكاتب الفنية.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="من نحن"
        title="منصة تشغيل مؤسسية لملفات المناقصات"
        description="TenderOne وُجدت لمساعدة الشركات على فهم دفاتر الشروط بسرعة، تنظيم المطلوبات بدقة، وتقديم ملفات احترافية قبل لحظة التقديم."
      />

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-7"
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

        <div className="mt-8 rounded-[2rem] border border-amber-200/15 bg-gradient-to-l from-amber-400/10 via-blue-950/20 to-transparent p-8 md:p-10">
          <h2 className="text-2xl font-black md:text-3xl">رؤيتنا</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            أن تصبح تجهيزات المناقصات عملية واضحة ومنظمة وقابلة للتوسع، بحيث
            تركّز الشركات على جودة العرض لا على فوضى الملفات والمتطلبات المخفية.
          </p>
        </div>
      </section>
    </>
  );
}
