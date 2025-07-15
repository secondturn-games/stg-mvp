# Environment Variables Checklist

## Required for MVP Deployment

### 🔐 Supabase Configuration

**Get these from your Supabase project dashboard → Settings → API**

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - **How to get**: Supabase Dashboard → Settings → API → Project URL
  - **Format**: `https://your-project-id.supabase.co`
  - **Example**: `https://abcdefghijklmnop.supabase.co`

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **How to get**: Supabase Dashboard → Settings → API → Project API keys → anon public
  - **Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Note**: This is safe to expose in client-side code

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - **How to get**: Supabase Dashboard → Settings → API → Project API keys → service_role secret
  - **Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Note**: Keep this secret! Only used server-side

### 👤 Clerk Authentication

**Get these from your Clerk dashboard → API Keys**

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - **How to get**: Clerk Dashboard → API Keys → Publishable Key
  - **Format**: `pk_test_...` or `pk_live_...`
  - **Note**: Safe to expose in client-side code

- [ ] `CLERK_SECRET_KEY`
  - **How to get**: Clerk Dashboard → API Keys → Secret Key
  - **Format**: `sk_test_...` or `sk_live_...`
  - **Note**: Keep this secret! Only used server-side

### 🔗 Clerk URLs (Optional - defaults provided)

These have sensible defaults, but you can customize them:

- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (default: `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (default: `/sign-up`)
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (default: `/`)
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (default: `/profile/setup`)

## Optional for Future Features

### 💳 Stripe Configuration (Phase 3)

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

### 🔍 Algolia Search (Phase 2)

- [ ] `NEXT_PUBLIC_ALGOLIA_APP_ID`
- [ ] `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`
- [ ] `ALGOLIA_ADMIN_API_KEY`

### ☁️ Cloudflare R2 Storage (Phase 2)

- [ ] `R2_ACCOUNT_ID`
- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_BUCKET_NAME`

### 🎲 BoardGamePrices.eu API (Phase 2)

- [ ] `BOARDGAMEPRICES_API_KEY`

### 📦 Shipping APIs (Phase 3)

- [ ] `OMNIVA_API_KEY`
- [ ] `DPD_API_KEY`

## How to Set in Vercel

### Method 1: Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the correct name and value
4. Set environment to "Production", "Preview", and "Development"

### Method 2: Vercel CLI

```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
```

### Method 3: GitHub Secrets (for CI/CD)

If using GitHub Actions, add these as repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- All environment variables above

## Security Notes

### ✅ Safe to Expose (NEXT*PUBLIC*\*)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- All Clerk URL variables

### 🔒 Keep Secret

- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`
- All Stripe keys
- All admin API keys

## Testing Environment Variables

After setting up, test that your environment variables work:

```bash
# Test locally
npm run dev

# Test build
npm run build

# Test deployment
vercel --prod
```

## Troubleshooting

### Common Issues:

1. **Missing variables**: Check that all required variables are set
2. **Wrong format**: Ensure URLs and keys are copied exactly
3. **Environment mismatch**: Make sure variables are set for all environments (Production, Preview, Development)
4. **CORS issues**: Add your Vercel domain to Clerk's allowed origins

### Debug Commands:

```bash
# Check current environment
vercel env ls

# Pull environment variables
vercel env pull .env.local

# View deployment logs
vercel logs
```
