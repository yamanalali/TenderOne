import { Sparkles } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 lg:px-8 lg:pt-20">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/8 px-4 py-2 text-xs font-bold text-amber-200">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
        {description}
      </p>
    </section>
  );
}
