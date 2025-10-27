import { SessionProvider } from "@/context/session-context";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  keywords: [
    "KingSocial",
    "Kingston",
    "Social Platform",
    "Student",
    "Student Platform",
    "Kingston University",
    "Kingston University Student Platform",
  ],
  authors: [
    { name: "Pablo Garcia Rius", url: "https://pablogrius.com" },
    { name: "KingSocial", url: "https://king-social.vercel.app/" },
  ],
  metadataBase: new URL("https://king-social.vercel.app/"),
  openGraph: {
    title: "KingSocial - A Kingston University Students' Social Platform",
    description:
      "Connect with the Kingston Univeristy community and level up your social life.",
    url: "https://king-social.vercel.app/",
    siteName: "KingSocial",
    images: [
      {
        url: "/KingSocialLogo.png",
        width: 512,
        height: 512,
        alt: "KingSocial Logo",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KingSocial - A Kingston University Students' Social Platform",
    description:
      "Connect with the Kingston Univeristy community and level up your social life.",
    images: ["/KingSocialLogo.png"],
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/KingSocialLogo.png",
        href: "/KingSocialLogo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/KingSocialLogoInverted.png",
        href: "/KingSocialLogoInverted.png",
      },
    ],
  },
  robots: { index: true, follow: true },
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
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}
