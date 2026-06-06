import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfficeOS Pitch Deck",
  description: "Seven-slide hackathon pitch deck for OfficeOS.",
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
