"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { retryAnalysisAction } from "@/app/actions/analyses";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function RetryAnalysisButton({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await retryAnalysisAction(analysisId);
          if (result.error) toast(result.error, "error");
          else {
            toast(result.success || "تمت إعادة تشغيل التحليل", "success");
            router.refresh();
          }
        })
      }
    >
      {pending ? "جاري إعادة التشغيل..." : "إعادة المحاولة"}
    </Button>
  );
}
