import { listAllProductsAdmin } from "@/app/actions/admin";
import { ProductAdminForm, ProductsList } from "@/components/admin-forms";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">المنتجات والنماذج</h1>
        <p className="mt-2 text-slate-600">إدارة الخدمات القابلة للشراء</p>
      </div>
      <ProductAdminForm />
      <ProductsList products={products} />
    </div>
  );
}
