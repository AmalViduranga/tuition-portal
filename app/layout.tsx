import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SITE_NAME } from "@/lib/content";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import SiteWrapper from "@/components/SiteWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathslk.online"),
  icons: {
    icon: "/AV_Logo_01.jpg",
  },
  title: "A/L Maths Sri Lanka | Best Mathematics Tuition | MathsLK",
  description: "Join MathsLK for top tier A/L Maths Sri Lanka classes. Access structured theory, revision, past papers, and online recordings with Amal Viduranga.",
  keywords: [
    "A/L Maths Sri Lanka",
    "A/L Mathematics",
    "Maths 07",
    "Sri Lanka tuition",
    "online maths classes",
    "revision class",
    "theory class",
    "A/L exam preparation",
  ],
  openGraph: {
    title: "A/L Maths Sri Lanka | Best Mathematics Tuition | MathsLK",
    description: "Looking for A/L Maths Sri Lanka? Join MathsLK for the best structured learning environment, active revision, and online past papers access.",
    url: "https://mathslk.online",
    siteName: "MathsLK",
    type: "website",
    locale: "en_LK",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f8fafc_40%,_#f8fafc_100%)] text-slate-900">
        <SiteWrapper user={user} profile={profile}>
          {children}
        </SiteWrapper>
      </body>
    </html>
  );
}
