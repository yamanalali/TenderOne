"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl border-rose-100 bg-rose-50/40">
      <CardTitle>خطأ في لوحة الإدارة</CardTitle>
      <CardDescription className="mt-2">
        تعذر تنفيذ العملية. أعد المحاولة أو راجع السجلات.
      </CardDescription>
      <div className="mt-5">
        <Button type="button" onClick={reset}>
          إعادة المحاولة
        </Button>
      </div>
    </Card>
  );
}
