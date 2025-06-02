import { FloatingBackButton } from "@/components/floating-back-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SessionProvider } from "@/context/session-context";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KingSocial",
  description:
    "Connect with the Kingston Univeristy community and level up your social life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
        <FloatingBackButton />
      </body>
      <Analytics />
    </html>
  );
}
