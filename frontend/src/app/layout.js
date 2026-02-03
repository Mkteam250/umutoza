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
  title: "Umutoza - Pass Your Rwanda Provisional Driving Test 2024/2025",
  description: "Umutoza ni urubuga rwa mbere mu Rwanda rugufasha kwitegura neza ikizamini cy'uruhushya rw'agateganyo.",
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
