import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getSession } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const destination =
    session?.user.role === "system_admin" ? "/admin" : "/dashboard";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_15%_35%,rgba(30,64,175,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(180,83,9,0.08),transparent_30%)]" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-25" />
      <SiteHeader isLoggedIn={Boolean(session)} destination={destination} />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
