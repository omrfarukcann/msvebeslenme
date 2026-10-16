import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "msvebeslenme | Diyetisyen Sümeyye Can",
  description: "Multipl Skleroz (MS) yolculuğunda anti-enflamatuar ve mikrobiyota odaklı bütüncül beslenme rehberliği.",
  metadataBase: new URL("https://msvebeslenme.com"),
  keywords: ["MS ve Beslenme", "Multipl Skleroz Beslenme", "Diyetisyen Sümeyye Can", "Anti-enflamatuar Diyet", "MS Diyeti"],
  authors: [{ name: "Diyetisyen Sümeyye Can" }],
  openGraph: {
    title: "msvebeslenme | Diyetisyen Sümeyye Can",
    description: "Multipl Skleroz yolculuğunda yasaklar değil, şifa veren beslenme alışkanlıkları.",
    url: "https://msvebeslenme.com",
    siteName: "msvebeslenme",
    images: [
      {
        url: "/hero-sumeyye.png",
        width: 1200,
        height: 630,
        alt: "Diyetisyen Sümeyye Can - msvebeslenme",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "msvebeslenme | Diyetisyen Sümeyye Can",
    description: "Multipl Skleroz yolculuğunda şifa veren beslenme rehberliği.",
    images: ["/hero-sumeyye.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}