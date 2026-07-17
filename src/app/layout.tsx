import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TenderOne | منصة إدارة وتجهيز المناقصات",
    template: "%s | TenderOne",
  },
  description:
    "منصة متخصصة تساعدك على فهم دفاتر الشروط، تنظيم متطلبات المناقصات، وتجهيز عروض فنية ومالية احترافية ترفع فرصك في الفوز بالعقود.",
  applicationName: "TenderOne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
