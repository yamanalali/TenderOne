import { daysUntil } from "@/lib/utils";

export type ComputedTenderStatus = "open" | "ending_soon" | "closed" | "new";

export function computeTenderStatus(
  deadlineAt?: string | Date | null,
  publishedAt?: string | Date | null,
  endingSoonDays = 7,
  newDays = 3,
): ComputedTenderStatus {
  const remaining = daysUntil(deadlineAt);
  if (remaining !== null && remaining < 0) return "closed";
  if (remaining !== null && remaining <= endingSoonDays) return "ending_soon";

  if (publishedAt) {
    const publishedRemaining = daysUntil(publishedAt);
    if (publishedRemaining !== null && publishedRemaining >= -newDays && publishedRemaining <= 0) {
      return "new";
    }
    const publishedDate =
      typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
    const ageDays = Math.floor(
      (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (ageDays >= 0 && ageDays <= newDays) return "new";
  }

  return "open";
}

export const statusMeta: Record<
  ComputedTenderStatus,
  { label: string; color: string; emoji: string }
> = {
  open: { label: "مفتوحة", color: "bg-emerald-100 text-emerald-800", emoji: "🟢" },
  ending_soon: {
    label: "تنتهي قريباً",
    color: "bg-amber-100 text-amber-800",
    emoji: "🟡",
  },
  closed: { label: "منتهية", color: "bg-rose-100 text-rose-800", emoji: "🔴" },
  new: { label: "جديدة", color: "bg-sky-100 text-sky-800", emoji: "🔵" },
};
