import Link from "next/link";
import { eq } from "drizzle-orm";
import { listActiveProducts } from "@/app/actions/payments";
import { requireCompanySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { entitlements } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function TemplatesPage() {
  const session = await requireCompanySession();
  const products = (await listActiveProducts()).filter((p) => p.type === "template");

  const owned = session.companyId
    ? await db
        .select()
        .from(entitlements)
        .where(eq(entitlements.companyId, session.companyId))
    : [];

  const ownedProductIds = new Set(
    owned.filter((e) => e.type === "template" && e.isActive).map((e) => e.productId),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">مكتبة النماذج</h1>
        <p className="mt-2 text-slate-600">
          نماذج احترافية جاهزة — يمكن شراؤها بشكل مستقل
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => {
          const unlocked = ownedProductIds.has(product.id);
          return (
            <Card key={product.id}>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{product.nameAr}</CardTitle>
                <Badge
                  className={
                    unlocked
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {unlocked ? "مفعّل" : "غير مفعّل"}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                {product.descriptionAr}
              </CardDescription>
              <p className="mt-4 font-bold text-teal-800">
                {product.price} {product.currency}
              </p>
              <div className="mt-4 flex gap-2">
                {unlocked ? (
                  <Link href={`/templates/${product.id}/download`}>
                    <Button>تنزيل</Button>
                  </Link>
                ) : (
                  <Link href="/payments">
                    <Button>شراء / تفعيل</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
