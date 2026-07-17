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

  let data;
  try {
    data = await getTemplateDownload(id);
  } catch {
    return (
      <Card>
        <CardTitle>غير مصرح</CardTitle>
        <CardDescription>
          يجب شراء النموذج وتفعيله من صفحة الدفع أولاً
        </CardDescription>
        <Link href={`/payments?productId=${id}`} className="mt-4 inline-block">
          <Button>شراء وتفعيل هذا النموذج</Button>
        </Link>
      </Card>
    );
  }

  const { product, file } = data;

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardTitle>الخدمة مفعّلة — جاهزة للتنزيل</CardTitle>
        <CardDescription className="mt-2">
          هذا هو مكان استخدام النموذج الذي اشترته. اختر طريقة التنزيل بالأسفل.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>{product.nameAr}</CardTitle>
        <CardDescription className="mt-2">
          أنشئ ملف Excel احترافياً ببيانات شركتك، مع خلايا منسقة وقابلة للتعبئة.
        </CardDescription>

        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`/api/templates/${product.id}/excel`}>
            <Button>إنشاء وتنزيل Excel</Button>
          </a>
          {file && (
            <a href={file.fileUrl} target="_blank" rel="noreferrer">
              <Button variant="outline">
                تنزيل الملف المرفوع — الإصدار {file.version}
              </Button>
            </a>
          )}
          <Link href="/templates">
            <Button variant="outline">عودة لمكتبة النماذج</Button>
          </Link>
          <Link href="/my-services">
            <Button variant="outline">خدماتي المفعّلة</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
