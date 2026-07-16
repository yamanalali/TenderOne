"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardTitle>تسجيل الدخول</CardTitle>
      <CardDescription>ادخل إلى منصة TenderOne للمناقصات</CardDescription>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "جاري الدخول..." : "دخول"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-teal-700">
          إنشاء حساب شركة
        </Link>
      </p>
    </Card>
  );
}

export function RegisterForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardTitle>إنشاء حساب شركة</CardTitle>
      <CardDescription>
        كل خدمة مستقلة — ابدأ بما تحتاجه فقط
      </CardDescription>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">اسم المسؤول</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="companyName">اسم الشركة</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">الهاتف</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "جاري الإنشاء..." : "إنشاء الحساب"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        لديك حساب؟{" "}
        <Link href="/login" className="font-semibold text-teal-700">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
