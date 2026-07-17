import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DOCUMENT_STYLE_META,
  DOCUMENT_TYPE_META,
} from "@/lib/documents/registry";
import type { DocumentTemplateDef } from "@/lib/documents/types";

export function TemplatePreviewCard({
  template,
  hasAccess,
  createHref,
}: {
  template: DocumentTemplateDef;
  hasAccess: boolean;
  createHref: string;
}) {
  const typeMeta = DOCUMENT_TYPE_META[template.type];
  const styleMeta = DOCUMENT_STYLE_META[template.style];

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div
        className="relative h-40 overflow-hidden px-5 py-5 text-white"
        style={{
          background: `linear-gradient(145deg, ${template.secondaryColor} 0%, ${template.accentColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="hero-grid h-full w-full" />
        </div>
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <Badge className="bg-white/15 text-white ring-1 ring-white/20">
              {styleMeta.nameAr}
            </Badge>
            <Sparkles className="h-4 w-4 text-white/70" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-white/60">
              {typeMeta.iconLabel}
            </p>
            <p className="mt-1 text-lg font-black">{typeMeta.nameAr}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-base font-black text-[#071426]">{template.nameAr}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
          {template.descriptionAr}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          {hasAccess ? (
            <Link href={createHref}>
              <Button className="gap-2">
                إنشاء مستند
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/payments">
              <Button variant="outline">تفعيل الباقة</Button>
            </Link>
          )}
          <span className="text-[10px] font-bold text-slate-400">{template.nameEn}</span>
        </div>
      </div>
    </div>
  );
}
