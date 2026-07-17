import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function PortalNotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardTitle>الصفحة غير موجودة</CardTitle>
      <CardDescription className="mt-2">
        لم نعثر على الصفحة المطلوبة. تحقق من الرابط أو عد إلى مساحة العمل.
      </CardDescription>
      <Link href="/dashboard" className="mt-5 inline-block">
        <Button>العودة للوحة التحكم</Button>
      </Link>
    </Card>
  );
}
