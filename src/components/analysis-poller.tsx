"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AnalysisPoller({
  analysisId,
  status,
  updatedAt,
}: {
  analysisId: string;
  status: string;
  updatedAt: string;
}) {
  const router = useRouter();
  const resumeInFlight = useRef(false);

  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const refreshTimer = setInterval(() => router.refresh(), 3000);
    const watchdogTimer = setInterval(async () => {
      const staleFor = Date.now() - new Date(updatedAt).getTime();
      if (staleFor < 120_000 || resumeInFlight.current) return;

      resumeInFlight.current = true;
      try {
        await fetch(`/api/analyses/${analysisId}/resume`, {
          method: "POST",
          cache: "no-store",
        });
        router.refresh();
      } finally {
        resumeInFlight.current = false;
      }
    }, 15_000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(watchdogTimer);
    };
  }, [analysisId, status, updatedAt, router]);

  return null;
}
