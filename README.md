# Tuition Class Website + Student Portal

Full-stack tuition portal for **Amal Viduranga** (A/L Mathematics), built with:
- Next.js App Router
- Supabase Auth + Postgres + RLS
- Tailwind CSS

## Features Included

- Public pages: Home, About, Results, Schedule, Contact, WhatsApp CTA
- Auth: login with email/password (no public sign-up)
- Portal: students see only classes they are enrolled in
- Content access: recordings and materials filtered by paid period + start date + manual unlocks
- Admin panel:
  - Create student accounts
  - Manage class groups
  - Add recordings (YouTube IDs)
  - Add materials (PDF URLs)
  - Manage enrollments/payment periods/manual unlocks
- SQL schema and RLS policies in `supabase/schema.sql`

## Folder Structure

```txt
app/
  admin/
    actions.ts
    classes/page.tsx
    enrollments/page.tsx
    materials/page.tsx
    recordings/page.tsx
    site-content/page.tsx
    students/page.tsx
    layout.tsx
    page.tsx
  auth/callback/route.ts
  portal/
    class/[classId]/page.tsx
    layout.tsx
    page.tsx
  about/page.tsx
  contact/page.tsx
  login/
    actions.ts
    page.tsx
  results/page.tsx
  schedule/page.tsx
  globals.css
  layout.tsx
  page.tsx
lib/
  auth.ts
  content.ts
  supabase/
    admin.ts
    client.ts
    middleware.ts
    server.ts
supabase/
  schema.sql
middleware.ts
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add Supabase keys to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. In Supabase SQL Editor, run `supabase/schema.sql`.
5. Create one admin user:
   - Create user in Supabase Auth first.
   - Set that user to admin:
   ```sql
   update public.profiles
   set role = 'admin', must_change_password = false
   where id = '<admin-user-uuid>';
   ```
6. Start app:
   ```bash
   npm run dev
   ```

## Notes

- `must_change_password` is included in schema; enforce on UI later if needed.
- Materials are stored as `file_url` (use Supabase Storage public/signed URLs).
- Public content currently comes from `lib/content.ts`; you can migrate this to `site_settings`.
