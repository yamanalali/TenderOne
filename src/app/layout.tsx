import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TenderOne | منصة المناقصات الذكية",
    template: "%s | TenderOne",
  },
  description:
    "منصة ذكية لتحليل المناقصات وتجهيز العروض الفنية والمالية، تساعد الشركات على فهم المتطلبات وضمان الامتثال ورفع فرص الفوز بالعقود.",
  applicationName: "TenderOne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
