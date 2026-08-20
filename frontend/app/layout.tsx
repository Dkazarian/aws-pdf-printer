import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWS PDF Printer",
  description: "Client status dashboard for the AWS PDF printer service",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
