import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

import { createClient } from "@/lib/supabase/server";
import SiteWrapper from "@/components/SiteWrapper";
import PromotionPopup from "@/components/PromotionPopup";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider, ToastProvider } from "@/components/ui";

// Consistent rendering for Sinhala lesson titles on every device.
const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathslk.online"),
  icons: {
    icon: "/AV_Logo_01-removebg-preview.png",
  },
  title: "MathsLK — G.C.E. A/L Mathematics with Amal Viduranga",
  description: "Online G.C.E. Advanced Level Mathematics classes by Amal Viduranga, with class schedules, recordings, and study materials in the student portal.",
  authors: [{ name: "Amal Viduranga" }],
  creator: "Amal Viduranga",
  publisher: "MathsLK",
  openGraph: {
    title: "MathsLK — G.C.E. A/L Mathematics with Amal Viduranga",
    description: "Online G.C.E. A/L Mathematics theory, revision, and paper classes with recordings and materials in the student portal.",
    url: "https://mathslk.online",
    siteName: "MathsLK",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "/AV_Logo_01-removebg-preview.png",
        width: 598,
        height: 380,
        alt: "Amal Viduranga Classes Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MathsLK — G.C.E. A/L Mathematics with Amal Viduranga",
    description: "Online G.C.E. A/L Mathematics classes by Amal Viduranga.",
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
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }
  const clientUser = user ? { id: user.id, email: user.email } : null;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sinhala.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}}catch(e){document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <SiteWrapper user={clientUser} profile={profile}>
              {children}
            </SiteWrapper>
            <PromotionPopup />
            <SpeedInsights />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
