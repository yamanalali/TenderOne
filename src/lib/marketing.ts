import {
  Building2,
  FileSearch,
  FileText,
  Package,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export const marketingNav = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
] as const;

export const marketingServices = [
  {
    slug: "tenders",
    number: "01",
    title: "مركز المناقصات",
    desc: "فرز دقيق، حالات مباشرة، ومواعيد نهائية أمامك في مشهد واحد.",
    details:
      "لوحة موحدة لعرض المناقصات مع فلاتر حسب التصنيف والجهة والمدينة والحالة، مع حساب الأيام المتبقية تلقائياً.",
    icon: FileText,
    accent: "from-amber-300 to-yellow-600",
  },
  {
    slug: "analysis",
    number: "02",
    title: "محلل دفتر الشروط",
    desc: "استخراج المطلوبات والمخاطر وأرقام الصفحات إلى Checklist دقيقة.",
    details:
      "ارفع أي ملف PDF — حتى لو لم تكن المناقصة منشورة داخل المنصة — واستخرج الوثائق والكادر والكفالات وشروط الرفض.",
    icon: FileSearch,
    accent: "from-yellow-200 to-amber-500",
  },
  {
    slug: "company-profile",
    number: "03",
    title: "هوية الشركة",
    desc: "ملف شركة مؤسسي بالعربية والإنجليزية بتصاميم جاهزة للتصدير.",
    details:
      "أدخل بيانات شركتك مرة واحدة، ثم أنشئ ملفات تعريف احترافية بعدة قوالب ولغات مع معاينة وطباعة PDF.",
    icon: Building2,
    accent: "from-amber-400 to-yellow-700",
  },
  {
    slug: "templates",
    number: "04",
    title: "مكتبة العمليات",
    desc: "نماذج احترافية للشراء والتقييم والاستلام وإغلاق العمليات.",
    details:
      "منشئ تفاعلي لبروفايل الشركة وعرض السعر والفاتورة وعرض الخدمات بـ 12 تصميماً، إضافة إلى نماذج تشغيلية جاهزة للتنزيل.",
    icon: Package,
    accent: "from-yellow-300 to-amber-600",
  },
  {
    slug: "payments",
    number: "05",
    title: "التفعيل والمدفوعات",
    desc: "طلبات دفع واضحة، مراجعة مركزية، وتفعيل آمن لكل خدمة.",
    details:
      "حوّل بنكيًا، ارفع إشعار التحويل، وفعّل الخدمة بعد موافقة مدير النظام دون بوابة دفع معقدة.",
    icon: Wallet,
    accent: "from-amber-200 to-yellow-500",
  },
  {
    slug: "security",
    number: "06",
    title: "بنية مستقلة وآمنة",
    desc: "كل خدمة تعمل وحدها. اختر ما تحتاجه وتوسع بلا تعقيد.",
    details:
      "عزل كامل لبيانات الشركات، صلاحيات واضحة، وسجل تدقيق للإجراءات الحساسة.",
    icon: ShieldCheck,
    accent: "from-yellow-100 to-amber-500",
  },
] as const;

export const marketingStats = [
  { value: "5", label: "خدمات مستقلة" },
  { value: "16+", label: "تصنيف مناقصة" },
  { value: "100%", label: "عزل بيانات الشركات" },
] as const;
