"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createDocumentAction } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CreateDocumentButton({
  templateKey,
  title,
  disabled,
  className,
}: {
  templateKey: string;
  title?: string;
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const formData = new FormData();
    formData.set("templateKey", templateKey);
    if (title) formData.set("title", title);
    formData.set("language", "ar");
    formData.set("status", "draft");

    startTransition(async () => {
      const result = await createDocumentAction({}, formData);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      if (result.error) {
        toast(result.error, "error");
      }
    });
  }

  return (
    <Button
      type="button"
      className={className}
      disabled={disabled || pending}
      onClick={handleClick}
    >
      {pending ? "جاري الإنشاء..." : "إنشاء مستند"}
    </Button>
  );
}
