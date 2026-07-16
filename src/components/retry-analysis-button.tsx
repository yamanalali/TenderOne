"use client";

import { useTransition } from "react";
import { retryAnalysisAction } from "@/app/actions/analyses";
import { Button } from "@/components/ui/button";

export function RetryAnalysisButton({ analysisId }: { analysisId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await retryAnalysisAction(analysisId);
        })
      }
    >
      {pending ? "جاري إعادة التشغيل..." : "إعادة المحاولة"}
    </Button>
  );
}
