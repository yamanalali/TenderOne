"use client";

import { Download } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";

export function ChecklistExportButtons({
  analysisId,
  disabled,
}: {
  analysisId: string;
  disabled?: boolean;
}) {
  if (disabled) return null;

  return (
    <div className="no-print flex flex-wrap gap-2">
      <a href={`/api/analyses/${analysisId}/checklist/excel`}>
        <Button type="button" variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          تنزيل Excel
        </Button>
      </a>
      <PrintButton
        documentTitle="قائمة المطلوبات"
        targetSelector="#checklist-print-area"
      />
    </div>
  );
}
