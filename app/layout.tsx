import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE BERKLEY | Quỹ căn 3D Demo",
  description: "Bản thử nghiệm dựng quỹ căn 3D từ ảnh mặt bằng 2D và dữ liệu polygon."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
