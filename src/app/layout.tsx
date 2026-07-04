import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A3 Prime Store | Your Trusted Neighborhood Store",
  description:
    "A3 Prime Store - Fresh products, honest prices. Everything your home needs, delivered with care. Owned by Akash Maurya, Bazar Neorhia, Jaunpur, Uttar Pradesh.",
  keywords: [
    "A3 Prime Store",
    "general store",
    "Jaunpur store",
    "grocery",
    "online store",
    "Akash Maurya",
  ],
  authors: [{ name: "Akash Maurya" }],
  openGraph: {
    title: "A3 Prime Store",
    description: "Fresh products. Honest prices. Delivered with care.",
    siteName: "A3 Prime Store",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
