import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfficeOS Demo",
  description: "Mock OfficeOS chat intake and source editor demo",
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
