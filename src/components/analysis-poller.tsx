"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AnalysisPoller({
  status,
}: {
  status: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (status === "completed" || status === "failed") return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [status, router]);

  return null;
}
