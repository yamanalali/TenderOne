import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  FileSearch,
  FileText,
  FolderKanban,
  LibraryBig,
  Sparkles,
  Wallet,
  WalletCards,
  Zap,
} from "lucide-react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { listActiveProducts } from "@/app/actions/payments";
import { getSession } from "@/lib/auth";
import { paymentsHrefForType } from "@/lib/product-destination";

const services = [
  {
    href: "/tenders",
    number: "01",
    title: "مركز المناقصات",
    desc: "تصفّح الفرص، راقب المواعيد، واتخذ القرار بسرعة.",
    icon: FileText,
  },
  {
    href: "/analyses",
    number: "02",
    title: "تحليل دفتر الشروط",
    desc: "حوّل دفتر الشروط إلى متطلبات واضحة وChecklist.",
    icon: FileSearch,
  },
  {
    href: "/company-profile",
    number: "03",
    title: "هوية الشركة",
    desc: "أنشئ ملفاً مؤسسياً بلغات وتصاميم متعددة.",
    icon: Building2,
  },
  {
    href: "/templates",
    number: "04",
    title: "مكتبة النماذج",
    desc: "12 تصميماً: بروفايل، عرض سعر، فاتورة، وخدمات.",
    icon: LibraryBig,
  },
  {
    href: "/documents",
    number: "05",
    title: "مستنداتي",
    desc: "عدّل المستندات المحفوظة واطبعها كـ PDF.",
    icon: FolderKanban,
  },
  {
    href: "/my-services",
    number: "06",
    title: "خدماتي ورصيدي",
    desc: "رصيدك وخدماتك المفعّلة وطلبات الشراء في مكان واحد.",
    icon: WalletCards,
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  const [stats, products] = await Promise.all([
    getDashboardStats(),
    listActiveProducts(),
  ]);
  const firstName = session?.user.name?.split(" ")[0] || "مرحباً";
  const analysisPaymentsHref = paymentsHrefForType(products, "analysis_credit");

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[#071426] px-6 py-8 text-white shadow-[0_28px_70px_rgba(8,20,39,0.2)] md:px-9 md:py-10">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-blue-700/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[11px] font-black text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              مركز عمليات TenderOne
            </div>
            <p className="text-sm font-semibold text-slate-400">
              أهلاً بعودتك، {firstName}
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
              حوّل كل فرصة إلى
              <span className="bg-gradient-to-l from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                {" "}
                عرض أقوى.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
              {session?.companyName || "شركتك"} — جميع أدوات التجهيز والتحليل
              تحت سيطرتك.
            </p>
          </div>

          <Link
            href="/analyses/new"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-300 to-yellow-500 px-6 text-sm font-black text-[#071426] shadow-[0_0_30px_rgba(245,158,11,0.18)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            تحليل ملف جديد
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href={stats.credits > 0 ? "/analyses/new" : analysisPaymentsHref}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">رصيد التحليل</p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {stats.credits}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {stats.credits > 0
              ? "اضغط لبدء تحليل ملف الآن"
              : "اشترِ رصيداً من المدفوعات"}
          </p>
        </Link>

        <Link
          href="/analyses"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">التحليلات المكتملة</p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {stats.analysesCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
              <FileSearch className="h-5 w-5 text-blue-800" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">إجمالي ملفات التحليل</p>
        </Link>

        <Link
          href="/my-services"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">قيد المراجعة</p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {stats.pendingPayments}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
              <Wallet className="h-5 w-5 text-amber-700" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">طلبات دفع بانتظار التفعيل</p>
        </Link>

        <Link
          href="/documents"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">مستنداتك</p>
              <p className="mt-2 text-4xl font-black text-[#071426]">
                {stats.documentsCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
              <FolderKanban className="h-5 w-5 text-slate-700" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">مستندات محفوظة وجاهزة</p>
        </Link>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-black text-amber-600">مركز الخدمات</p>
            <h2 className="mt-1 text-2xl font-black text-[#071426]">
              أدواتك المؤسسية
            </h2>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">
            اختر الخدمة التي تريدها — كل خدمة مستقلة
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.href}
                href={service.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300/60 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)]"
              >
                <div className="absolute left-0 top-0 h-20 w-20 -translate-x-8 -translate-y-8 rounded-full bg-amber-300/0 blur-2xl transition group-hover:bg-amber-300/20" />
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071426] text-amber-300 shadow-lg shadow-slate-900/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-slate-300">
                    {service.number}
                  </span>
                </div>
                <h3 className="mt-7 text-lg font-black text-[#071426]">
                  {service.title}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {service.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-amber-700">
                  فتح الخدمة
                  <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
