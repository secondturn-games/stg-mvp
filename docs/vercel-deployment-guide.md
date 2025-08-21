# 🚀 Vercel Deployment Guide

## **Overview**

This guide ensures that all authentication flows (signup, verification, profile setup) work correctly on Vercel preview deployments.

## **Current Configuration Status**

### **✅ Already Configured for Vercel**

- **OAuth Callback Route** (`/app/auth/callback/route.ts`): Dynamically detects Vercel preview URLs
- **Join Page** (`/app/join/page.tsx`): Uses dynamic environment detection
- **Auth Context** (`/lib/auth.ts`): Falls back to current origin if env var not set

### **🔄 Recently Fixed**

- **Verify Page** (`/app/join/verify/page.tsx`): Now dynamically detects environment for `redirectTo`

### **📋 Environment Variables Needed**

#### **For Local Development**

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **For Vercel Preview/Production**

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# or for production
NEXT_PUBLIC_APP_URL=https://secondturn.games
```

## **Authentication Flow on Vercel**

### **1. Signup Flow**

```
User signs up → Supabase creates account → Redirect to /join/verify
```

### **2. Email Verification Flow**

```
User clicks email link → Supabase verifies → Redirect to /auth/verify → /profile/setup
```

### **3. Profile Setup Flow**

```
User completes profile → Redirect to /games
```

## **Critical URLs for Vercel**

### **Supabase Dashboard Configuration**

#### **Site URL**

- **Local**: `http://localhost:3000`
- **Vercel Preview**: `https://your-branch-name.vercel.app`
- **Production**: `https://secondturn.games`

#### **Redirect URLs**

Add these to Supabase Auth Settings:

**For OAuth (Google):**

```
http://localhost:3000/auth/callback
https://your-branch-name.vercel.app/auth/callback
https://secondturn.games/auth/callback
```

**For Email Verification:**

```
http://localhost:3000/auth/verify
https://your-branch-name.vercel.app/auth/verify
https://secondturn.games/auth/verify
```

## **Deployment Checklist**

### **Before Pushing to Vercel**

1. **✅ Update Supabase Redirect URLs**

   - Add your Vercel preview URL to Supabase Auth settings
   - Include both OAuth and email verification redirects

2. **✅ Check Environment Variables**

   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly
   - Or rely on dynamic detection (already implemented)

3. **✅ Test Local Authentication**
   - Verify signup flow works locally
   - Check email verification redirects

### **After Vercel Deployment**

1. **✅ Test Authentication Flow**

   - Try signing up with a new email
   - Verify email verification works
   - Complete profile setup

2. **✅ Check OAuth Flow**

   - Test Google sign-in
   - Verify redirects work correctly

3. **✅ Monitor Error Logs**
   - Check Vercel function logs
   - Monitor Supabase dashboard for errors

## **Troubleshooting Common Issues**

### **1. "Invalid redirect URL" Error**

**Problem**: Supabase rejects the redirect URL
**Solution**: Add your Vercel preview URL to Supabase Auth settings

### **2. Email Verification Not Working**

**Problem**: Users can't verify their email
**Solution**: Check that `/auth/verify` redirect URL is added to Supabase

### **3. OAuth Redirects to Wrong Domain**

**Problem**: Google OAuth redirects to localhost or production
**Solution**: Update Supabase OAuth redirect URLs

### **4. Profile Setup Not Loading**

**Problem**: Users stuck on verification page
**Solution**: Check that `redirectTo` in verify page uses correct domain

## **Dynamic Environment Detection**

### **How It Works**

```typescript
// Automatically detects Vercel preview URLs
const currentOrigin =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000'
const isVercelPreview = currentOrigin.includes('vercel.app')
const baseUrl = isVercelPreview
  ? currentOrigin
  : process.env.NEXT_PUBLIC_APP_URL || currentOrigin
```

### **Benefits**

- **No manual configuration** needed for each branch
- **Automatic fallback** to environment variable
- **Works seamlessly** across all environments

## **Testing Strategy**

### **Local Testing**

```bash
npm run dev
# Test: http://localhost:3000/join
```

### **Vercel Preview Testing**

```bash
git push origin your-branch-name
# Test: https://your-branch-name.vercel.app/join
```

### **Production Testing**

```bash
git push origin main
# Test: https://secondturn.games/join
```

## **Monitoring & Debugging**

### **Vercel Logs**

```bash
vercel logs your-project-name
```

### **Supabase Dashboard**

- Check Auth > Users for signup attempts
- Monitor Auth > Logs for errors
- Verify redirect URLs are correct

### **Browser Console**

- Check for redirect errors
- Monitor network requests
- Look for authentication failures

## **Best Practices**

### **1. Always Test on Preview**

- Never deploy authentication changes directly to production
- Use Vercel preview deployments for testing

### **2. Keep Redirect URLs Updated**

- Add new preview URLs to Supabase as needed
- Remove old/expired URLs regularly

### **3. Monitor Error Rates**

- Set up alerts for authentication failures
- Track user journey completion rates

### **4. Document Changes**

- Update this guide when making auth changes
- Keep Supabase configuration documented

## **Current Status**

### **✅ Ready for Vercel**

- All authentication flows use dynamic URL detection
- OAuth callback route handles Vercel previews
- Email verification uses correct redirects
- Profile setup flow is environment-agnostic

### **🚀 Next Steps**

1. Push your branch to trigger Vercel preview
2. Add preview URL to Supabase redirect URLs
3. Test complete authentication flow
4. Monitor for any issues

## **Support Resources**

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Project Issues](https://github.com/your-repo/issues)
