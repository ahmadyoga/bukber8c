import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bukber8c.vercel.app'),
  title: "Bukber Alumni 8C Official — Ramadhan 1447 H",
  description:
    "Undangan Buka Puasa Bersama Alumni 8C Official. Konfirmasi kehadiran dan lihat siapa saja yang hadir!",
  keywords: ["bukber", "alumni", "8C Official", "ramadhan", "1447 H", "buka puasa bersama"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Bukber Alumni 8C Official — Ramadhan 1447 H",
    description: "Yuk ikut Bukber Alumni 8C Official! Konfirmasi kehadiran kamu di sini 🌙",
    type: "website",
    url: "https://bukber8c.vercel.app",
    siteName: "Bukber Alumni 8C Official",
    images: [{
      url: "/icon.png",
      width: 800,
      height: 800,
      alt: "Bukber Alumni 8C Official",
    }],
  },
  twitter: {
    card: "summary",
    title: "Bukber Alumni 8C Official — Ramadhan 1447 H",
    description: "Yuk ikut Bukber Alumni 8C Official! Konfirmasi kehadiran kamu di sini 🌙",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable}`}>
      <body>
        {/* Islamic pattern overlay */}
        <div className="islamic-bg" aria-hidden="true" />

        {/* Floating stars */}
        <div className="stars" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {children}
      </body>
    </html>
  );
}
