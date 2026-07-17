import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "no-print inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-amber-700",
        className,
      )}
    >
      <ArrowRight className="h-4 w-4" />
      {label}
    </Link>
  );
}
