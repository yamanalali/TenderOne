import { DocumentRenderer } from "@/components/documents/DocumentRenderer";
import type { DocumentTemplateDef } from "@/lib/documents/types";
import type { DocumentContent, DocumentLanguage } from "@/lib/documents/types";
import { cn } from "@/lib/utils";

export function DocumentCanvas({
  content,
  template,
  language,
  scale = 1,
  className,
}: {
  content: DocumentContent;
  template: DocumentTemplateDef;
  language: DocumentLanguage;
  scale?: number;
  className?: string;
}) {
  const isLtr = language === "en";

  return (
    <div className={cn("document-canvas-shell", className)}>
      <div
        dir={isLtr ? "ltr" : "rtl"}
        lang={isLtr ? "en" : "ar"}
        className="document-a4 overflow-hidden bg-white shadow-[0_25px_60px_rgba(15,23,42,0.12)]"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
        }}
      >
        <DocumentRenderer content={content} template={template} language={language} />
      </div>
    </div>
  );
}
