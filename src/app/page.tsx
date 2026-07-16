import Link from "next/link";
import {
  Building2,
  FileSearch,
  FileText,
  Package,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "المناقصات",
    desc: "تصفح المناقصات مع التصنيفات والفلاتر وحالة المناقصة والأيام المتبقية.",
    icon: FileText,
  },
  {
    title: "تحليل دفتر الشروط",
    desc: "ارفع أي PDF واستخرج المطلوبات مع أرقام الصفحات وChecklist تلقائية.",
    icon: FileSearch,
  },
  {
    title: "ملف تعريف الشركة",
    desc: "أدخل بيانات شركتك مرة واحدة وأنشئ ملفاً احترافياً بعدة تصاميم ولغات.",
    icon: Building2,
  },
  {
    title: "مكتبة النماذج",
    desc: "نماذج جاهزة لطلب الشراء وعروض الأسعار والاستلام وغيرها.",
    icon: Package,
  },
  {
    title: "نظام الدفع",
    desc: "حوّل بنكيًا، ارفع الإشعار، وفعّل الخدمة بعد موافقة الإدارة.",
    icon: Wallet,
  },
  {
    title: "خدمات مستقلة",
    desc: "استخدم أي خدمة وحدها أو اجمعها حسب احتياج شركتك.",
    icon: ShieldCheck,
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div>
          <p className="text-sm font-black tracking-wide text-teal-700">
            TenderOne
          </p>
          <h1 className="text-xl font-black text-slate-900">
            منصة المناقصات الذكية
          </h1>
        </div>
        <div className="flex gap-2">
          {session ? (
            <Link href={session.user.role === "system_admin" ? "/admin" : "/dashboard"}>
              <Button>لوحة التحكم</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">دخول</Button>
              </Link>
              <Link href="/register">
                <Button>ابدأ الآن</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
              TenderOne للشركات
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              حلّل دفتر الشروط، نظّم المطلوبات، وجهّز ملفاتك بثقة
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              المنصة لا تتدخل في التقديم نفسه. تركّز على التحليل والتنظيم وتجهيز
              الملفات، ويمكنك استخدام أي خدمة دون الالتزام بالخدمات الأخرى.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">إنشاء حساب شركة</Button>
              </Link>
              <Link href="/tenders">
                <Button size="lg" variant="secondary">
                  استعراض المناقصات
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xl shadow-teal-100/50">
            <div className="grid gap-4 sm:grid-cols-2">
              {services.slice(0, 4).map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                  >
                    <Icon className="h-5 w-5 text-teal-700" />
                    <h3 className="mt-3 font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{service.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <Icon className="h-6 w-6 text-teal-700" />
                <h3 className="mt-3 text-lg font-bold">{service.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{service.desc}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
