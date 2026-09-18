import type { Metadata } from "next";
import { Lora, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/site/providers";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL } from "@/config/site";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Dr. Sayali Sawant",
  },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Dr. Sayali Sawant",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} ${lora.variable}`}>
      <body
        className="bg-background font-sans text-ink antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
