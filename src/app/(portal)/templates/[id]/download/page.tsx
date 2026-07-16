import Link from "next/link";
import { getTemplateDownload } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function TemplateDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let file;
  try {
    file = await getTemplateDownload(id);
  } catch {
    return (
      <Card>
        <CardTitle>غير مصرح</CardTitle>
        <CardDescription>
          يجب شراء النموذج وتفعيله من صفحة الدفع أولاً
        </CardDescription>
        <Link href="/payments" className="mt-4 inline-block">
          <Button>الذهاب للدفع</Button>
        </Link>
      </Card>
    );
  }

  if (!file) {
    return (
      <Card>
        <CardTitle>الملف غير متوفر بعد</CardTitle>
        <CardDescription>
          تمت الموافقة على المنتج لكن ملف القالب لم يُرفع من الإدارة. يمكنك
          استخدام النموذج النصي الافتراضي أدناه.
        </CardDescription>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm whitespace-pre-wrap">
          {defaultTemplateBody(id)}
        </div>
        <Link href="/templates" className="mt-4 inline-block">
          <Button variant="outline">عودة</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{file.fileName}</CardTitle>
      <CardDescription>الإصدار {file.version}</CardDescription>
      <a href={file.fileUrl} className="mt-4 inline-block" target="_blank" rel="noreferrer">
        <Button>تنزيل الملف</Button>
      </a>
    </Card>
  );
}

function defaultTemplateBody(productId: string) {
  return `نموذج احترافي جاهز
معرف المنتج: ${productId}

- بيانات الجهة الطالبة
- تفاصيل الطلب
- الجدول الزمني
- التوقيعات والاعتمادات

(يمكن لمدير النظام رفع ملف Word/PDF رسمي من لوحة المنتجات)`;
}
