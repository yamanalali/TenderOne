import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { marketingFaq } from "@/lib/marketing";

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="الأسئلة الشائعة"
        title="إجابات سريعة عن الأسئلة المتكررة"
        description="رفع الملفات، التسعير، التفعيل، والخدمات اليدوية — كل ما تحتاجه قبل البدء."
      />

      <section className="mx-auto max-w-3xl space-y-4 px-5 pb-16 lg:px-8">
        {marketingFaq.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-white/8 bg-white/[0.035] p-5 open:border-amber-300/25"
          >
            <summary className="cursor-pointer list-none font-black text-white marker:content-none">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span className="shrink-0 text-amber-300 transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {item.answer}
            </p>
          </details>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 lg:px-8">
        <div className="rounded-[2rem] border border-amber-300/15 bg-amber-300/5 p-8 text-center">
          <h2 className="text-2xl font-black">
            لست متأكداً من الخدمة المناسبة؟
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            تواصل معنا، وسنساعدك في اختيار الخدمة الأنسب لاحتياجك.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-l from-amber-300 to-yellow-500 px-6 text-sm font-black text-[#091426]"
          >
            تواصل معنا
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
