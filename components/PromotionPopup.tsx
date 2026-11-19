"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Image from "next/image";

interface Promotion {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  target_url: string;
}

export default function PromotionPopup() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Do not show on admin routes
    if (pathname.startsWith("/admin")) return;

    const fetchPromotion = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("promotions")
          .select("id, title, description, image_url, target_url")
          // The public policy already filters active and valid dates
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) return;

        const dismissedId = localStorage.getItem("dismissedPromotionId");
        if (dismissedId !== data.id) {
          setPromotion(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch promotion", err);
      }
    };

    fetchPromotion();
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (promotion) {
      localStorage.setItem("dismissedPromotionId", promotion.id);
    }
  };

  useEffect(() => {
    if (!isOpen || !promotion) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        localStorage.setItem("dismissedPromotionId", promotion.id);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, promotion]);

  if (!isOpen || !promotion) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleImageClick = () => {
    handleClose();
    router.push(promotion.target_url || "/contact");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={promotion.title || "Announcement"}
      onClick={handleBackdropClick}
    >
      <div className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/75 text-white transition-colors hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Close promotion"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div
          className="relative max-h-[80vh] w-full cursor-pointer overflow-y-auto"
          onClick={handleImageClick}
        >
          <Image
            src={promotion.image_url}
            alt={promotion.title || "Promotion"}
            width={1200}
            height={1200}
            className="w-full h-auto object-contain"
          />
          {(promotion.title || promotion.description) && (
            <div className="bg-card p-4 text-center border-t border-border">
              {promotion.title && (
                <h2 className="text-xl font-bold text-foreground">{promotion.title}</h2>
              )}
              {promotion.description && (
                <p className="mt-2 text-sm text-muted-foreground">{promotion.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
