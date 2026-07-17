"use client";

import { useTransition } from "react";
import { toggleChecklistItemAction } from "@/app/actions/analyses";

export function ChecklistToggle({
  itemId,
  isCompleted,
}: {
  itemId: string;
  isCompleted: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      disabled={pending}
      onChange={(e) => {
        startTransition(async () => {
          await toggleChecklistItemAction(itemId, e.target.checked);
        });
      }}
      aria-label={isCompleted ? "إلغاء تحديد البند كمكتمل" : "تحديد البند كمكتمل"}
      className="h-5 w-5 cursor-pointer rounded-md border-slate-300 accent-teal-700 disabled:cursor-wait disabled:opacity-60"
    />
  );
}
