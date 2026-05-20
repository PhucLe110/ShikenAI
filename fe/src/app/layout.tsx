import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "ShikenAI - Luyện thi tiếng Nhật thông minh",
  description: "Hệ thống luyện thi JLPT tích hợp công nghệ phát hiện gian lận.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
