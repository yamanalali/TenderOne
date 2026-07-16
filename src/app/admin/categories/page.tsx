import { listAllCategoriesAdmin } from "@/app/actions/admin";
import { CategoryAdminForm } from "@/components/admin-forms";

export default async function AdminCategoriesPage() {
  const categories = await listAllCategoriesAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">التصنيفات</h1>
        <p className="mt-2 text-slate-600">إضافة وتعطيل تصنيفات المناقصات</p>
      </div>
      <CategoryAdminForm categories={categories} />
    </div>
  );
}
