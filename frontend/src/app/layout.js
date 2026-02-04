import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SessionHeartbeat from "@/components/SessionHeartbeat";
import PromotionDisplay from "@/components/PromotionDisplay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://umutoza.pages.dev'),
  title: {
    default: "Umutoza - Pass Your Rwanda Provisional Driving Test 2025",
    template: "%s | Umutoza"
  },
  description: "Umutoza ni urubuga rwa mbere mu Rwanda rugufasha kwitegura neza ikizamini cy'uruhushya rw'agateganyo. Iga amategeko y'umuhanda mu buryo bworoshye.",
  keywords: ["Rwanda provisional driving test", "amategeko y'umuhanda", "ikizamini cy'agateganyo", "driving license Rwanda"],
  openGraph: {
    title: "Umutoza - Rwanda Driving Test Prep",
    description: "Prepare for your driving test with Rwanda's #1 study platform.",
    url: 'https://umutoza.rw',
    siteName: 'Umutoza',
    locale: 'rw_RW',
    type: 'website',
  },
  icons: {
    icon: "/umutoza.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <SessionHeartbeat />
        <PromotionDisplay />
        {children}
      </body>
    </html>
  );
}
