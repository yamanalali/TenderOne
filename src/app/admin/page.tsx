import { getAdminDashboardData } from "@/app/actions/admin";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">لوحة الإدارة</h1>
        <p className="mt-2 text-slate-600">إدارة المنصة والخدمات المستقلة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardTitle>{data.usersCount}</CardTitle>
          <CardDescription>المستخدمون</CardDescription>
        </Card>
        <Card>
          <CardTitle>{data.tendersCount}</CardTitle>
          <CardDescription>المناقصات</CardDescription>
        </Card>
        <Card>
          <CardTitle>{data.categoriesCount}</CardTitle>
          <CardDescription>التصنيفات</CardDescription>
        </Card>
        <Card>
          <CardTitle>{data.productsCount}</CardTitle>
          <CardDescription>المنتجات والنماذج</CardDescription>
        </Card>
      </div>

      <Card>
        <CardTitle>إعدادات سريعة</CardTitle>
        <CardDescription className="mt-2">
          أيام «تنتهي قريباً»: {data.settings.endingSoonDays} — أيام «جديدة»:{" "}
          {data.settings.newTenderDays}
        </CardDescription>
      </Card>
    </div>
  );
}
