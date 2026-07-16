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
      className="h-4 w-4 rounded border-slate-300"
    />
  );
}
