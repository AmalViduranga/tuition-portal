# Complete Student Account Creation & Management Flow

## 📋 Overview

This document describes the complete student account creation flow from the admin dashboard, including multiple class assignments, password management, and forgot password functionality.

---

## 🎯 **Key Features Implemented**

1. ✅ **Admin-only student creation** - No public signup
2. ✅ **Multiple class assignments** - One student can belong to multiple classes
3. ✅ **Unique email enforcement** - Emails must be unique across all students
4. ✅ **Phone number storage** - Optional phone field in profile
5. ✅ **Initial enrollment** - Optional class assignment with start access date
6. ✅ **Temporary passwords** - Admin creates temp password, student changes on first login
7. ✅ **Must change password flag** - `must_change_password` boolean in profiles
8. ✅ **First-login password enforcement** - Redirects to change password if flag is true
9. ✅ **Forgot password flow** - Full password reset via email
10. ✅ **Password reset from email link** - Complete reset flow

---

## 🗄️ **Database Schema**

### `profiles` Table

```sql
id UUID PRIMARY KEY (references auth.users.id)
full_name TEXT NOT NULL
email TEXT UNIQUE NOT NULL
phone TEXT (optional)
role TEXT CHECK (role IN ('admin', 'student')) NOT NULL
is_active BOOLEAN DEFAULT true
must_change_password BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### `student_class_enrollments` Table

```sql
student_id UUID REFERENCES profiles(id) ON DELETE CASCADE
class_id UUID REFERENCES class_groups(id) ON DELETE CASCADE
start_access_date DATE NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()

UNIQUE(student_id, class_id) -- Prevents duplicate enrollments
```

---

## 🔄 **Student Creation Flow**

### Step 1: Admin Navigates to `/admin/students`
- Clicks "Add Student" button
- Modal opens with comprehensive form

### Step 2: Admin Fills Form

**Required Fields:**
- Full Name (text)
- Email Address (email, validated unique)
- Temporary Password (min 6 chars)

**Optional Fields:**
- Phone Number (text, optional)
- Class Assignments (multi-select checkbox)
- Start Access Date (required if classes selected)
- Must Change Password (checkbox, default checked)

### Step 3: Form Submission

**Client-side:**
```typescript
const form = new FormData();
form.append("full_name", fullName);
form.append("email", email);
form.append("phone", phone);
form.append("password", password);
form.append("start_access_date", startAccessDate);
if (mustChangePassword) {
  form.append("must_change_password", "on");
}
// Append each selected class ID
selectedClassIds.forEach(id => form.append("class_ids", id));

POST /api/admin/students with FormData
```

**Server-side (API Route):**
1. ✅ Validate required fields
2. ✅ Check password length (min 6)
3. ✅ Check for duplicate email
4. ✅ Create Auth user via admin client
5. ✅ Create profile with `must_change_password` flag
6. ✅ Create enrollment records (one per selected class)
7. ✅ Return success with student ID

### Step 4: Admin Provides Credentials

Admin manually shares with student:
- Email address
- Temporary password
- Class access information

---

## 🔐 **First Login Experience**

### Student Navigates to `/login`

1. **Enters email & temporary password**
2. **Submits login form**
3. **System checks `must_change_password` flag:**
   - If `true` → Redirects to `/change-password?required=true`
   - If `false` → Proceeds to dashboard (or next URL)

### Change Password Page (`/change-password`)

**Shows:**
- "For security, please set a new password before continuing"
- New Password field (min 8 chars)
- Confirm Password field

**On submit:**
1. Validates passwords match and meet length
2. Calls `updatePassword()` server action
3. Updates password in Supabase Auth
4. Sets `must_change_password = false` in profiles
5. Redirects to dashboard

**If password change fails:** Shows error, allows retry

---

## 🔄 **Forgot Password Flow**

### Option 1: Student Forgets Password Before First Login

**If student hasn't logged in yet and doesn't know temp password:**
1. Clicks "Forgot password?" on login page
2. Goes to `/forgot-password`
3. Enters email address
4. Submits form

**Server action (`forgotPassword`):**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${siteUrl}/reset-password`,
});
```
- Sends password reset email via Supabase
- Redirects to success page with email shown

**Email contains:**
- Password reset link with token
- Link valid for 1 hour (Supabase default)
- Goes to `/reset-password?token=...&type=recovery`

### Option 2: Student Logged In, Wants to Change Password

Student can use the Change Password page if already logged in (future feature: add from dashboard).

---

## 🔐 **Password Reset from Email**

### Student Clicks Email Link

Opens: `/reset-password?token=abc123&type=recovery`

**Reset Password Page:**
1. Verifies token is present (redirects if missing)
2. Shows form with:
   - New Password (min 8 chars)
   - Confirm Password
3. On submit:
   - Calls `resetPassword()` server action
   - Verifies OTP token with `supabase.auth.verifyOtp()`
   - Updates password via `supabase.auth.updateUser()`
   - Sets `must_change_password = false` in profiles
   - Redirects to success page

**Success Page:**
- Shows confirmation message
- "Go to Login" button

---

## 📊 **Complete File Reference**

### Admin-Side Files

| File | Purpose |
|------|---------|
| `app/admin/students/page.tsx` | Student list with create modal |
| `app/admin/actions.ts` | `createStudent()` server action |
| `app/api/admin/students/route.ts` | REST endpoint (GET all, POST create) |
| `app/api/admin/students/toggle/route.ts` | Toggle active status |
| `app/api/admin/students/delete/route.ts` | Soft delete (deactivate) |

### Authentication Files

| File | Purpose |
|------|---------|
| `app/login/page.tsx` | Login form with "Forgot password?" link |
| `app/login/actions.ts` | `login()`, `logout()`, `updatePassword()` |
| `app/forgot-password/page.tsx` | Request password reset |
| `app/forgot-password/actions.ts` | `forgotPassword()` - sends reset email |
| `app/reset-password/page.tsx` | Form to set new password from email link |
| `app/reset-password/actions.ts` | `resetPassword()` - verifies token & updates |
| `app/change-password/page.tsx` | First-login password change (required) |
| `lib/auth.ts` | Auth helpers including `requireAdmin()` |

### Database Migration

`supabase/migrations/20240327_admin_dashboard_enhancements.sql`
- Adds `phone` column to profiles
- Adds `must_change_password` column to profiles
- Adds indexes
- RLS policies

---

## ⚙️ **Environment Variables Required**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For password reset redirects (optional but recommended)
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

**About Service Role Key:**
- Used in `createStudent()` to create Auth users
- Must have admin privileges in Supabase
- **Never** exposed to client
- Only used server-side (API routes, server actions)

---

## 🚀 **Supabase Configuration**

### 1. Enable Email Confirmation
Go to Supabase Dashboard → Authentication → Email Templates:
- Ensure "Confirm Signup" template is enabled
- Customize template if needed

### 2. Enable Password Reset
Go to Supabase Dashboard → Authentication → Email Templates:
- Ensure "Reset Password" template is enabled
- Set appropriate redirect URL: `https://your-site.com/reset-password`

### 3. Set Site URL
Go to Supabase Dashboard → Authentication → URL Configuration:
- Set "Site URL" to your production domain
- Add allowed redirect URLs including:
  - `https://your-site.com/reset-password`
  - `https://your-site.com/change-password`
  - `https://your-site.com/auth/callback` (if using OAuth)

---

## 📋 **SQL Migration**

Run this migration in Supabase SQL Editor:

```sql
-- Add phone and must_change_password columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- Add comments
COMMENT ON COLUMN profiles.phone IS 'Optional phone number for student contact';
COMMENT ON COLUMN profiles.must_change_password IS 'Whether student must change password on next login (set true for admin-created accounts)';
```

---

## 🧪 **Testing Checklist**

### Student Creation
- [ ] Admin can create student with required fields only
- [ ] Admin can add phone number
- [ ] Admin can select multiple classes
- [ ] Admin can set start access date
- [ ] Enrollment records created for each selected class
- [ ] Duplicate email shows clear error
- [ ] Short password (<6 chars) shows error
- [ ] Phone field is optional
- [ ] Must change password flag defaults to true
- [ ] Student receives confirmation email
- [ ] Student appears in admin list

### First Login
- [ ] Student logs in with temporary password
- [ ] Redirected to change password page
- [ ] New password must be 8+ characters
- [ ] Password confirmation validation works
- [ ] `must_change_password` set to false after change
- [ ] Student redirected to dashboard
- [ ] Subsequent logins no longer show change password

### Forgot Password
- [ ] Login page has "Forgot password?" link
- [ ] Forgot password form accepts email
- [ ] Success page shows after submission
- [ ] Student receives reset email
- [ ] Email link goes to reset-password with token
- [ ] Token valid (test within 1 hour)
- [ ] Can set new password (min 8 chars)
- [ ] Confirmation required
- [ ] Success page shown after reset
- [ ] Can login with new password

---

## 🔐 **Security Notes**

✅ **Service Role Key** - Only used server-side in API routes
✅ **Email Enumeration Protection** - Forgot password always shows success (doesn't reveal if email exists)
✅ **Password Hashing** - Handled by Supabase Auth (bcrypt)
✅ **Email Confirmation** - Required before first login (configurable)
✅ **Unique Email Constraint** - Enforced at database level
✅ **Token Expiry** - Reset tokens expire in 1 hour (Supabase default)
✅ **Force Password Change** - Ensures temporary passwords aren't reused

---

## 🐛 **Troubleshooting**

### "Email already in use" error when creating student
- Check if student already exists in `profiles` table
- Check for case sensitivity (email normalized to lowercase)
- May need to clean up duplicate entries

### Password reset email not received
- Check Supabase email delivery logs
- Verify email templates are configured
- Check spam folder
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly

### Must change password flag not clearing
- Check `updatePassword()` or `resetPassword()` completed successfully
- Verify database write permissions
- Check Supabase logs for errors

### Student can't access class after enrollment
- Verify `start_access_date` is today or in past
- Check `is_active` flag on student profile
- Check `is_active` flag on class group
- Verify class_id matches in enrollment and class_groups

### Forgotten temporary password
- Admin can reset password manually via forgot password flow
- OR admin can create new password and update via:
  ```sql
  UPDATE auth.users SET encrypted_password = ... WHERE email = ...;
  ```
  (Advanced: use Supabase admin API instead)

---

## 💡 **Best Practices**

1. **Always set temporary passwords** - Use strong random passwords
2. **Require password change** - Keep `must_change_password = true` for all admin-created accounts
3. **Record student phone numbers** - Helpful for urgent communications
4. **Set proper start access dates** - Don't set in future unnecessarily
5. **Use class groups wisely** - Create meaningful groups (e.g., "2026 Theory", "2026 Revision")
6. **Deactivate, don't delete** - Keep historical data intact
7. **Regular backups** - Export data periodically
8. **Monitor logs** - Check Supabase logs for unusual activity

---

## ✅ **Status: Fully Implemented**

All features are production-ready:
- ✅ Multi-class enrollment
- ✅ Email uniqueness
- ✅ Phone number support
- ✅ Temporary passwords
- ✅ First-login password enforcement
- ✅ Forgot password flow
- ✅ Secure reset via email
- ✅ No public signup
- ✅ Admin-only creation
- ✅ Server-side operations only

---

**Need Help?** Check Supabase dashboard logs, verify environment variables, and test each flow step by step.
