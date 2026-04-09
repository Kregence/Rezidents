# Rezidents Production Deployment Guide

## 1. Environment Variable Setup

### Public Variables (can be exposed to client)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | `https://rezidents.vercel.app` |
| `PAYSTACK_PUBLIC_KEY` | Live public key | `pk_live_xxxxxxxxxxxxxxxx` |

### Server-Only Variables (never exposed to client)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PAYSTACK_SECRET_KEY` | Secret key for server-side Paystack | `sk_live_xxxxxxxxxxxxxxxx` |
| `PAYSTACK_WEBHOOK_SECRET` | Webhook signature secret | `whsec_xxxxxxxxxxxxxxxx` |

**Important:** Never prefix server-only variables with `NEXT_PUBLIC_`

---

## 2. Vercel Deployment Setup

### Step 1: Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

Or use Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → Project
3. Import your GitHub repository
4. Configure as follows:

| Setting | Value |
|----------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### Step 2: Set Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Critical:** `NEXT_PUBLIC_APP_URL` must match your exact Vercel domain (e.g., `https://rezidents.vercel.app`)

### Step 3: Redeploy After Env Changes

After changing environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete

### Step 4: Next.js App Router Settings

The following is already configured in our app:
- Middleware at `src/middleware.ts` (note: Next.js 16+ uses `proxy` convention)
- Server actions in API routes
- Dynamic routes for protected pages

No additional Vercel configuration needed.

---

## 3. Supabase Production Configuration

### Step 1: Verify Production Project

1. Go to https://supabase.com/dashboard
2. Confirm you're using the correct production project (not development)
3. Note the project URL

### Step 2: Apply Schema

In Supabase Dashboard → SQL Editor:

1. Copy contents of `supabase/migrations/001_initial_schema.sql`
2. Run the SQL
3. Verify tables created:
   - `streets`
   - `profiles`
   - `properties`
   - `units`
   - `residents`
   - `levies`
   - `payments`
   - `etag_eligibility`

### Step 3: Verify RLS Policies

All tables have RLS enabled. Verify in:
Supabase Dashboard → Authentication → Policies

### Step 4: Configure Auth Provider

1. Go to Authentication → Providers → Email
2. Enable "Enable Email Signup"
3. Confirm "Confirm email" is off (for production) or on (for testing)

### Step 5: Create Super Admin User

```sql
-- In Supabase SQL Editor
-- After creating auth user via Dashboard → Authentication → Users

INSERT INTO profiles (id, full_name, email, role)
VALUES (
  'auth-user-id-from-dashboard',
  'Super Admin',
  'admin@yourdomain.com',
  'super_admin'
);
```

---

## 4. Supabase Auth URL Configuration

### Step 1: Set Site URL

1. Go to Authentication → URL Configuration
2. Set **Site URL** to your production URL:
   ```
   https://your-app.vercel.app
   ```

### Step 2: Add Redirect URLs

Add these to **Redirect URLs**:

```
https://your-app.vercel.app
https://your-app.vercel.app/login
http://localhost:3000
http://localhost:3000/login
```

### Why This Matters

| Issue | Cause | Fix |
|-------|-------|-----|
| Login redirects fail | Site URL mismatch | Set exact production URL |
| Session doesn't persist | Missing redirect URL | Add all redirect URLs |
| OAuth callbacks fail | Redirect URL not in list | Add production URL |

---

## 5. Paystack Production Configuration

### Step 1: Switch to Live Keys

1. Go to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Copy **live** secret key (starts with `sk_live_`)
4. Copy **live** public key (starts with `pk_live_`)
5. Add to Vercel environment variables

**Warning:** Never use test keys (`sk_test_`, `pk_test_`) in production

### Step 2: Register Webhook URL

1. Go to Settings → Webhooks → Add webhook
2. Set URL:
   ```
   https://your-app.vercel.app/api/paystack/webhook
   ```
3. Enable events:
   - `charge.success`
   - `charge.failed`

### Step 3: Verify Webhook

After deployment, test webhook:

```bash
# Send test webhook from Paystack dashboard
# Check Vercel function logs for incoming requests
```

### Troubleshooting Webhook

| Issue | Likely Cause | Fix |
|-------|---------------|-----|
| Webhook not hitting | URL mismatch | Verify exact URL matches |
| Signature verification fails | Wrong secret | Check `PAYSTACK_WEBHOOK_SECRET` |
| Payments not updating | Key mismatch | Ensure live keys in production |

---

## 6. Production Route Validation

| Route | Access | Expected Behavior |
|-------|--------|-------------------|
| `/` | Public | Landing page with link to `/login` |
| `/login` | Public | Login form; redirects to role dashboard on success |
| `/super-admin` | super_admin only | Dashboard loads; others redirect |
| `/street-admin` | street_admin only | Dashboard loads; others redirect |
| `/resident` | resident only | Dashboard loads; others redirect |
| `/pay/[slug]` | Public | Shows street, levies, residents for that street |
| `/payment-status/[reference]` | Public | Shows payment status (pending/success/failed) |
| `/receipt/[reference]` | Payment owner | Shows receipt if status=success |
| `/api/paystack/webhook` | Paystack only | Processes webhook, updates payment |

### Test Each Route

1. **Public routes:** Access without login
2. **Protected routes:** Verify redirect to `/login` when logged out
3. **Wrong role:** Verify redirect to correct dashboard

---

## 7. Session and Middleware Validation

### Step 1: Test Session Persistence

1. Log in at `/login`
2. Refresh the page
3. Verify you stay logged in
4. Verify you're on the correct dashboard

### Step 2: Test Middleware Protection

1. Copy a protected URL (e.g., `/super-admin`)
2. Open in incognito window
3. Verify redirect to `/login`

### Step 3: Test Role Redirects

| Login As | Access | Should Redirect To |
|----------|--------|-------------------|
| super_admin | `/street-admin` | `/super-admin` |
| street_admin | `/resident` | `/street-admin` |
| resident | `/super-admin` | `/resident` |

### Step 4: Test Logout

1. Click Sign Out
2. Verify redirect to `/login`
3. Try accessing protected route
4. Verify redirect to `/login` again

---

## 8. Payments and Webhook Validation

### Step 1: Create Pending Payment

1. Go to `/pay/[valid-slug]`
2. Select resident
3. Select levy
4. Enter payer details
5. Submit
6. Verify:
   - Payment created in database with `status='pending'`
   - Redirect to Paystack checkout

### Step 2: Complete Payment

1. Complete Paystack payment
2. Return to `/payment-status/[reference]`
3. Verify status shows "pending" (before webhook)

### Step 3: Verify Webhook Processing

1. Wait for webhook OR check status manually
2. Verify in database:
   - `status` = 'success'
   - `paid_at` = timestamp
   - `paystack_reference` = set

### Step 4: Verify Eligibility Update

If levy `is_etag_eligible = true`:
1. Check `etag_eligibility` table
2. Verify record exists with:
   - `is_eligible = true`
   - `resident_id` matches
   - `levy_id` matches

### Critical Rules

- **Never** confirm payment from frontend callback alone
- **Only** webhook (`charge.success`) marks payment as success
- **Always** verify Paystack signature in webhook

---

## 9. PDF Receipt Validation

### Step 1: Test Successful Payment Receipt

1. Complete payment (webhook confirmed)
2. Go to `/receipt/[reference]`
3. Verify receipt displays with:
   - Street name
   - Resident name
   - Levy title
   - Amount paid
   - Payment date
4. Test print/save functionality

### Step 2: Test Unpaid Receipt Denial

1. Try `/receipt/[pending-reference]`
2. Verify 404 or "not found" response

### Step 3: Test Unauthorized Receipt Access

1. Try accessing another user's receipt
2. Verify access denied (if ownership check exists)

---

## 10. Error Monitoring and Final Safety Checks

### Step 1: Check Deployment Logs

In Vercel Dashboard → Functions:
- Check for 500 errors
- Check for authentication errors
- Check for database connection errors

### Step 2: Check Webhook Logs

In Vercel:
```bash
vercel logs -f --role=scheduler
```

Look for:
- Incoming webhook requests
- Signature verification failures
- Payment update successes/failures

### Step 3: Common Issues

| Issue | Likely Cause | Fix |
|-------|---------------|-----|
| Login fails | Supabase Site URL wrong | Set exact URL in Auth settings |
| Redirect loop | Multiple redirect URLs | Clean up redirect list |
| Webhook 401 | Wrong signature secret | Verify `PAYSTACK_WEBHOOK_SECRET` |
| Server error on API | Missing env var | Check all required variables set |
| RLS denies access | Policy misconfigured | Check Supabase policies |
| Payment always pending | Webhook not reaching | Verify webhook URL, test with Paystack |

### Step 4: Pre-Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase Site URL configured
- [ ] Redirect URLs added
- [ ] Paystack webhook registered with live URL
- [ ] Paystack live keys in use (not test)
- [ ] All routes tested
- [ ] Session persistence working
- [ ] Middleware redirects working
- [ ] Payment flow tested end-to-end
- [ ] Webhook processing verified
- [ ] Receipts generating for successful payments
- [ ] No server errors in Vercel logs

---

## Deployment Complete

After completing all steps above, Rezidents will be fully deployed and operational on:

- **Frontend:** Vercel (your-app.vercel.app)
- **Backend:** Supabase
- **Payments:** Paystack

All 7 prompts are now production-ready.
