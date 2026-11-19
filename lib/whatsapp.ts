import { contactData } from "@/lib/content";

export const DEFAULT_WHATSAPP_NUMBER = contactData.whatsapp;
export const DEFAULT_PHONE_NUMBER = contactData.phone;

/**
 * Normalizes a Sri Lankan or international phone string into pure international digits
 * suitable for https://wa.me/<digits> links.
 */
export function normalizeWhatsAppNumber(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) {
    return DEFAULT_WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `94${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats +94753681070 as "+94 75 368 1070" for readable display.
 */
export function formatPhoneDisplay(phone?: string | null): string {
  const digits = normalizeWhatsAppNumber(phone);
  if (digits.startsWith("94") && digits.length === 11) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export function buildTelUrl(phone?: string | null): string {
  return `tel:+${normalizeWhatsAppNumber(phone ?? DEFAULT_PHONE_NUMBER)}`;
}

export function buildWhatsAppUrl(options?: {
  phone?: string | null;
  message?: string | null;
}): string {
  const digits = normalizeWhatsAppNumber(options?.phone ?? DEFAULT_WHATSAPP_NUMBER);
  const message = options?.message?.trim();
  if (!message) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildClassEnquiryMessage(className: string): string {
  const cleanName = className.trim();
  if (!cleanName) {
    return "Hi, I would like to enquire about A/L Mathematics classes.";
  }
  return `Hi, I would like to enquire about the ${cleanName} Mathematics class.`;
}

export function buildClassWhatsAppUrl(className: string, phone?: string | null): string {
  return buildWhatsAppUrl({
    phone,
    message: buildClassEnquiryMessage(className),
  });
}
