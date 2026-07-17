import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function AdminNotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardTitle>الصفحة غير موجودة</CardTitle>
      <CardDescription className="mt-2">
        لم نعثر على صفحة الإدارة المطلوبة.
      </CardDescription>
      <Link href="/admin" className="mt-5 inline-block">
        <Button>العودة للوحة الإدارة</Button>
      </Link>
    </Card>
  );
}