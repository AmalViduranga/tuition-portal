# Performance, Security & UI Checklist

This document tracks the optimizations made to mathslk.online (tuition-portal) and provides manual steps required for complete configuration on Vercel, Supabase, and DNS providers.

## 1. UI Consistency & Theming
- **Colors:** Transitioned globally from the `indigo` & `purple` theme to a professional `blue/navy` brand direction (`blue-600` primary buttons, `emerald-500` accents).
- **Fonts:** Migrated from `Geist` to Google `Inter` font, loading natively via `next/font/google` to eliminate layout shifts and avoid extra network hops.

## 2. Image Optimization
- Audited `app/page.tsx`, `app/about/page.tsx`, `app/portal/page.tsx`, and `PromotionPopup.tsx`.
- Converted standard `<img>` tags to `next/image` (`<Image />`) utilizing native WebP/AVIF optimizations and `sizes` attributes for responsive breakpoints.
- Enabled `images.remotePatterns` in `next.config.ts` for Supabase (`*.supabase.co`) and YouTube (`i.ytimg.com`).

## 3. Metadata & SEO Optimization
- Upgraded the root `app/layout.tsx` metadata.
- Implemented comprehensive `OpenGraph` tags (`title`, `description`, `siteName`, `locale`, `url`, `images`) and `twitter:card` setups.
- Updated `keywords`, `authors`, `creator`, and `publisher` tags to improve SEO discoverability for "A/L Maths Sri Lanka".

## 4. Performance & Analytics
- Avoided unneeded `use client` directives to maintain server components.
- Integrated `@vercel/speed-insights` globally via `app/layout.tsx`.
- Refrained from setting up a PWA or Service Worker immediately due to the risks of stale caching on authenticated student routes.

## 5. Security Headers & Environment Variables
- Safe security headers injected globally via `next.config.ts`:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=()`
- Removed `X-Powered-By: Next.js`.
- Confirmed `SUPABASE_SERVICE_ROLE_KEY` is not leaked to client bundles.

---

## Manual Tasks Required (Administrator)

### 1. Vercel Configuration
- **Speed Insights:** Log in to your Vercel Dashboard, go to your project, and click the **Speed Insights** tab to enable data collection.
- **Firewall/WAF:** Review Vercel's Web Application Firewall options to enable rate limits for sensitive routes like `/login` and `/admin/*`.
- **Environment Variables:** Verify Production, Preview, and Development environment variables are correctly split. Ensure the Service Role key is strictly server-side.

### 2. Supabase Configuration
- **Storage Buckets:** Verify the privacy of the `materials` bucket if PDFs are meant to be exclusive to enrolled students.
- **Auth Configuration:** Confirm Auth rate-limits are enabled (Dashboard > Authentication > Rate Limits). Double-check that your "Allowed Redirect URLs" strictly list your production domains.
- **RLS Policies:** Confirmed functioning correctly.

### 3. DNS & Email Provider (Namecheap/Cloudflare)
- Consider utilizing a custom domain email (e.g. `support@mathslk.online`).
- Configure SPF, DKIM, and DMARC in your DNS dashboard to verify outgoing emails and ensure high deliverability (avoiding spam folders).
