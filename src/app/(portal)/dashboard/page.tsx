import Link from "next/link";
import {
  Building2,
  FileSearch,
  FileText,
  Package,
  Wallet,
} from "lucide-react";
import { getMyAnalysisCredits } from "@/app/actions/analyses";
import { getSession } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const cards = [
  {
    href: "/tenders",
    title: "المناقصات",
    desc: "تصفح وصنف وفلتر المناقصات المنشورة",
    icon: FileText,
  },
  {
    href: "/analyses",
    title: "تحليل دفتر الشروط",
    desc: "خدمة مستقلة — ارفع أي PDF حتى لو لم تكن المناقصة منشورة",
    icon: FileSearch,
  },
  {
    href: "/company-profile",
    title: "ملف الشركة",
    desc: "أنشئ ملف تعريف احترافي بعدة تصاميم ولغات",
    icon: Building2,
  },
  {
    href: "/templates",
    title: "مكتبة النماذج",
    desc: "اشترِ وحمّل النماذج الجاهزة فقط إن احتجتها",
    icon: Package,
  },
  {
    href: "/payments",
    title: "الدفع والتفعيل",
    desc: "حوّل وارفع الإشعار لتفعيل أي خدمة",
    icon: Wallet,
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  const credits = session?.companyId ? await getMyAnalysisCredits() : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
        <p className="mt-2 text-slate-600">
          مرحباً {session?.user.name}
          {session?.companyName ? ` — ${session.companyName}` : ""}
        </p>
      </div>

      <Card className="bg-teal-700 text-white">
        <CardTitle className="text-white">رصيد تحليل دفاتر الشروط</CardTitle>
        <CardDescription className="text-teal-100">
          يمكنك استخدام خدمة التحليل بشكل مستقل عن المناقصات
        </CardDescription>
        <p className="mt-4 text-4xl font-black">{credits}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition hover:border-teal-300 hover:shadow-md">
                <Icon className="h-6 w-6 text-teal-700" />
                <CardTitle className="mt-3">{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
