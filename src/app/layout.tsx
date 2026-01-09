import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burrito League",
  description: "Track the Burrito League running competition",
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
