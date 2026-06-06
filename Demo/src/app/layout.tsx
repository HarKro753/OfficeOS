import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfficeOS Markdown Demo",
  description: "Mock markdown source editor for the OfficeOS demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
