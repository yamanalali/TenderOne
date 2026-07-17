"use client";

import { useActionState } from "react";
import { contactAction } from "@/app/actions/contact";
import type { ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    contactAction,
    {} as ActionState,
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="block text-sm md:col-span-1">
        <span className="mb-2 block font-semibold text-slate-300">الاسم</span>
        <input
          name="name"
          required
          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none ring-amber-400 placeholder:text-slate-600 focus:ring-2"
          placeholder="اسمك الكامل"
        />
      </label>
      <label className="block text-sm md:col-span-1">
        <span className="mb-2 block font-semibold text-slate-300">البريد</span>
        <input
          name="email"
          type="email"
          required
          dir="ltr"
          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none ring-amber-400 placeholder:text-slate-600 focus:ring-2"
          placeholder="email@company.com"
        />
      </label>
      <label className="block text-sm md:col-span-2">
        <span className="mb-2 block font-semibold text-slate-300">الرسالة</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-amber-400 placeholder:text-slate-600 focus:ring-2"
          placeholder="كيف يمكننا مساعدتك؟"
        />
      </label>
      <div className="md:col-span-2 space-y-3">
        {state.error && (
          <p className="text-sm font-semibold text-rose-300">{state.error}</p>
        )}
        {state.success && (
          <p className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
            {state.success}
          </p>
        )}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 bg-gradient-to-l from-amber-300 to-yellow-500 px-6 text-sm font-black text-[#091426] hover:brightness-110"
        >
          {pending ? "جاري الإرسال..." : "إرسال الرسالة"}
        </Button>
      </div>
    </form>
  );
}
