import type { Product } from "@/lib/db/schema";

export type ProductDestination = {
  href: string;
  label: string;
  description: string;
};

/**
 * Builds a /payments link with the matching product pre-selected.
 * When several products match, the cheapest one is chosen.
 */
export function paymentsHrefForType(
  products: Pick<Product, "id" | "type" | "price">[],
  type: Product["type"],
): string {
  const match = products
    .filter((product) => product.type === type)
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
  return match ? `/payments?productId=${match.id}` : "/payments";
}

export function getProductDestination(
  product: Pick<Product, "id" | "type" | "metadata">,
): ProductDestination {
  const metadata = product.metadata as {
    serviceCode?: string;
    fulfillment?: string;
  } | null;

  if (metadata?.fulfillment === "manual") {
    return {
      href: "/my-services",
      label: "متابعة الخدمة",
      description:
        "خدمة تُنفَّذ يدوياً بعد الموافقة — سنتواصل معك لإكمال المطلوب.",
    };
  }

  if (product.type === "analysis_credit") {
    return {
      href: "/analyses/new",
      label: "ابدأ تحليل ملف",
      description: "ارفع كل ملفات المناقصة المرتبطة وسيُخصم تحليل واحد من رصيدك.",
    };
  }

  if (product.type === "company_profile") {
    return {
      href: "/company-profile",
      label: "أنشئ ملف شركتك",
      description: "أدخل بيانات الشركة واختر التصميم واللغة المناسبة.",
    };
  }

  if (product.type === "template") {
    return {
      href: `/templates/${product.id}/download`,
      label: "تنزيل النموذج",
      description: "افتح صفحة التنزيل واحصل على النسخة الجاهزة للاستخدام.",
    };
  }

  if (metadata?.serviceCode === "documents_pack") {
    return {
      href: "/templates",
      label: "افتح معرض التصاميم",
      description: "اختر التصميم ثم أنشئ مستندك وعدّله وصدّره كملف PDF.",
    };
  }

  return {
    href: "/my-services",
    label: "استخدم الخدمة",
    description: "افتح خدماتك للوصول إلى الخدمة المفعّلة.",
  };
}
