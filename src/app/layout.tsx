import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SteelWheel Auto | Invoice Generator",
  description: "Car Dealership Invoice Generator with Supabase integration and a galaxy-themed UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-poppins">{children}</body>
    </html>
  );
}
