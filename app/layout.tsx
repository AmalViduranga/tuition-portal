import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { createClient } from "@/lib/supabase/server";
import SiteWrapper from "@/components/SiteWrapper";
import PromotionPopup from "@/components/PromotionPopup";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathslk.online"),
  icons: {
    icon: "/AV_Logo_01-removebg-preview.png",
  },
  title: "Amal Viduranga Classes | G.C.E A/L Mathematics Tuition | MathsLK",
  description: "Join Amal Viduranga for the best G.C.E. Advanced Level Mathematics tuition in Sri Lanka. Access recordings, materials, class schedules, and your online student portal.",
  keywords: [
    "A/L Maths Sri Lanka",
    "A/L Mathematics",
    "Maths 07",
    "Amal Viduranga",
    "Sri Lanka tuition",
    "online maths classes",
    "A/L exam preparation",
  ],
  authors: [{ name: "Amal Viduranga" }],
  creator: "Amal Viduranga",
  publisher: "MathsLK",
  openGraph: {
    title: "Amal Viduranga Classes | G.C.E A/L Mathematics Tuition",
    description: "Looking for A/L Maths Sri Lanka? Join MathsLK for the best structured learning environment, active revision, and online past papers access.",
    url: "https://mathslk.online",
    siteName: "MathsLK",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "/AV_Logo_01-removebg-preview.png",
        width: 800,
        height: 600,
        alt: "Amal Viduranga Classes Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amal Viduranga Classes | G.C.E A/L Mathematics Tuition",
    description: "Join Amal Viduranga for the best G.C.E. Advanced Level Mathematics tuition in Sri Lanka.",
    images: ["/AV_Logo_01-removebg-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "IdcB-HLq2vgDRzft5O4uvRzj0O3P7Fjx_cQXO5TnTRY",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SiteWrapper user={user} profile={profile}>
          {children}
        </SiteWrapper>
        <PromotionPopup />
        <SpeedInsights />
      </body>
    </html>
  );
}
