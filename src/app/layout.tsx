import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TKV KPI - Hệ Thống Đánh Giá KPI Hàng Tháng",
  description: "Phần mềm đánh giá hiệu quả công việc và xếp loại KPI nhân viên định kỳ hàng tháng Công ty TKV",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
