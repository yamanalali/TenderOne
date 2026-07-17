import {
  DOCUMENT_TEMPLATES,
  mapLegacyProfileTemplate,
} from "@/lib/documents/registry";
import type { DocumentStyle } from "@/lib/documents/types";

export type ProfileTemplate = {
  key: string;
  nameAr: string;
  nameEn: string;
  description: string;
  accent: string;
  style: DocumentStyle;
};

export const PROFILE_TEMPLATES: ProfileTemplate[] = DOCUMENT_TEMPLATES.filter(
  (t) => t.type === "company_profile",
).map((t) => ({
  key: t.key,
  nameAr: t.nameAr,
  nameEn: t.nameEn,
  description: t.descriptionAr,
  accent: t.accentColor,
  style: t.style,
}));

export function getProfileTemplate(key: string) {
  const direct = PROFILE_TEMPLATES.find((t) => t.key === key);
  if (direct) return direct;

  const style = mapLegacyProfileTemplate(key);
  return (
    PROFILE_TEMPLATES.find((t) => t.style === style) ?? PROFILE_TEMPLATES[0]
  );
}
