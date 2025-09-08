import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community Packs",
  description:
    "A portal app to create, manage and publish Fable Community Packs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable}  antialiased`}>{children}</body>
      <script async src="/dialogs.js" type={"module"} />
      <script async src="/clipboards.js" type={"module"} />
    </html>
  );
}
