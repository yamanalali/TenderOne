import { getSettingsAction } from "@/app/actions/admin";
import { SettingsAdminForm } from "@/components/admin-forms";

export default async function AdminSettingsPage() {
  const settings = await getSettingsAction();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">الإعدادات</h1>
        <p className="mt-2 text-slate-600">
          ضبط حالات المناقصات والحساب البنكي وحدود الرفع
        </p>
      </div>
      <SettingsAdminForm settings={settings} />
    </div>
  );
}
