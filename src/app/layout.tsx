import type { Metadata } from "next";
import { Inter, Manrope, Bodoni_Moda, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wearables Atelier — Clothing & Fine Jewelry",
    template: "%s · Wearables Atelier",
  },
  description:
    "Wearables by Ashabi. Nigerian occasionwear, Iro & Buba and statement jewellery. Culture, luxury and elegance from Lagos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} ${bodoni.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" gap={8} />
      </body>
    </html>
  );
}
