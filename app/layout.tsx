import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lock In",
  description: "Frictionless focus session trigger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}