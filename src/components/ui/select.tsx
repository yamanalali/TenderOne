import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
