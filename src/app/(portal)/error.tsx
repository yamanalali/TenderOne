"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function PortalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl border-rose-100 bg-rose-50/40">
      <CardTitle>تعذر تحميل الصفحة</CardTitle>
      <CardDescription className="mt-2">
        حدث خطأ غير متوقع. حاول مرة أخرى، أو عد إلى لوحة التحكم.
      </CardDescription>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          إعادة المحاولة
        </Button>
        <Button type="button" variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          العودة للوحة التحكم
        </Button>
      </div>
    </Card>
  );
}
