import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burrito League Stats",
  description: "Global stats from Burrito League",
};

export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#1a1a1a]">
      {children}
    </div>
  );
}
