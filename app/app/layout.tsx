import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./index.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BTH Programs",
  description: "Get an overview of the programs at BTH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
