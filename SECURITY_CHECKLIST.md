# Security Configuration Checklist

This document tracks the security improvements made to the tuition-portal project and outlines manual configuration steps required by administrators.

## 1. Automated Security Headers (Implemented)
The following HTTP security headers have been globally implemented via `next.config.ts`:
- **Content-Security-Policy (CSP):** Restricts scripts, styles, fonts, and images to known sources (self, Supabase, YouTube). Automatically enables `upgrade-insecure-requests` in production.
- **X-Frame-Options:** `DENY` (Prevents clickjacking by blocking the site from being embedded in iframes).
- **X-Content-Type-Options:** `nosniff` (Prevents browsers from MIME-sniffing a response away from the declared content-type).
- **Referrer-Policy:** `strict-origin-when-cross-origin` (Reduces referrer leakage when navigating to external sites).
- **Permissions-Policy:** Restricts access to sensitive browser features (camera, microphone, geolocation, etc.) to prevent abuse.
- **X-Powered-By:** Removed Next.js powered-by header for information obscurity.

## 2. Supabase Security Audit (Completed)
- **Environment Variables:** Analyzed client/server separation. `SUPABASE_SERVICE_ROLE_KEY` is securely kept server-side only in API routes and server actions.
- **RLS Policies:** Confirmed that `20260406_strict_rls_policies.sql` establishes Row Level Security correctly on database tables.
- **Console Logs:** Investigated frontend logs; no exposed secrets or tokens found. 

---

## 3. Manual Security Tasks Required 

The following steps must be completed manually in your external services to ensure full protection.

### A) Supabase Configuration
- **Storage Buckets:** 
  - The `materials` bucket is currently configured as `public`. It is highly recommended to recreate this as a **private bucket** and update the code to serve files via **signed URLs** if these materials are exclusive to enrolled students.
- **Auth Rate Limits:** 
  - Go to **Supabase Dashboard > Authentication > Rate Limits**. Ensure proper rate limiting is enabled for email/password sign-ins to prevent brute force attacks.
- **Allowed Redirect URLs:** 
  - Go to **Authentication > URL Configuration** and ensure only your specific domains (`https://mathslk.online`, `http://localhost:3000`) are listed in the Site URL and Additional Redirect URLs.

### B) Vercel WAF / Firewall Configuration
To prevent Auth Abuse (brute-forcing, scraping), enable Vercel's Web Application Firewall (WAF) or Edge Middleware rate limiting:
- **Enable Managed Rules** if available on your Vercel plan.
- **Add Custom Rules** to challenge or rate-limit repeated requests to sensitive paths:
  - `/login`
  - `/forgot-password`
  - `/reset-password`
  - `/admin/*`
  - `/api/admin/*`

### C) Domain-based Email Authentication
Avoid using personal Gmail accounts for transactional emails.
- Configure domain-based emails (e.g., `support@mathslk.online`, `admin@mathslk.online`).
- Set up **SPF**, **DKIM**, and **DMARC** records in your DNS provider (e.g., Cloudflare, Namecheap) to prevent spoofing and ensure high email deliverability.

### D) Environment Variable Management
- Verify in **Vercel Project Settings > Environment Variables** that Production, Preview, and Development variables are properly isolated.
- Ensure no sensitive secrets (like API keys intended for the server) are prefixed with `NEXT_PUBLIC_`.

---

## 4. Post-Deployment Testing Checklist

After the next production deployment, please verify the following:

- [ ] Inspect network requests on the live site (F12 > Network tab). Click on the main document request and ensure the new security headers are present.
- [ ] Confirm the site loads without CSP errors in the browser console.
- [ ] Ensure public images (thumbnails, promotional images) load correctly.
- [ ] Verify YouTube videos can be played within the modal/player on the recordings page.
- [ ] Verify that students can log in, access their dashboard, and download/view PDF materials.
- [ ] Ensure the admin panel and file upload features remain fully functional.
