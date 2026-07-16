export type ProfileTemplate = {
  key: string;
  nameAr: string;
  nameEn: string;
  description: string;
  accent: string;
};

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    key: "classic",
    nameAr: "كلاسيكي",
    nameEn: "Classic",
    description: "تصميم رسمي بسيط مناسب للمناقصات الحكومية",
    accent: "#0f766e",
  },
  {
    key: "modern",
    nameAr: "عصري",
    nameEn: "Modern",
    description: "تصميم حديث بألوان جريئة ومساحات واسعة",
    accent: "#1d4ed8",
  },
  {
    key: "corporate",
    nameAr: "مؤسسي",
    nameEn: "Corporate",
    description: "مظهر مؤسسي أنيق مع تركيز على الخبرات",
    accent: "#7c3aed",
  },
];

export function getProfileTemplate(key: string) {
  return PROFILE_TEMPLATES.find((t) => t.key === key) ?? PROFILE_TEMPLATES[0];
}
