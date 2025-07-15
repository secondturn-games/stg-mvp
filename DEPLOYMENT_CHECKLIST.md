# Deployment Checklist

## Pre-Deployment Setup

### ✅ Vercel Account

- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`

### ✅ GitHub Repository

- [ ] Push all code to GitHub
- [ ] Ensure main branch is up to date
- [ ] Create develop branch for preview deployments

### ✅ Environment Variables

- [ ] Supabase URL and keys
- [ ] Clerk publishable and secret keys
- [ ] All variables set in Vercel dashboard

## Development Environment (Preview)

### ✅ Initial Setup

- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables for Preview
- [ ] Test deployment from develop branch

### ✅ Database Setup

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies configured
- [ ] Test database connections

### ✅ Authentication Setup

- [ ] Clerk application created
- [ ] Allowed origins configured
- [ ] Test sign-in/sign-up flow

## Production Environment

### ✅ Production Setup

- [ ] Environment variables set for Production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled

### ✅ Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Profile creation works
- [ ] Game listings work
- [ ] Search and filtering work
- [ ] Auction system works
- [ ] Image uploads work
- [ ] Mobile responsiveness verified

### ✅ Performance

- [ ] Core Web Vitals optimized
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Loading times acceptable

## Monitoring Setup

### ✅ Analytics

- [ ] Vercel Analytics enabled
- [ ] Core Web Vitals monitoring
- [ ] Error tracking configured

### ✅ Alerts

- [ ] Deployment failure alerts
- [ ] Performance monitoring
- [ ] Uptime monitoring

## Security Checklist

### ✅ Environment Variables

- [ ] No secrets in code
- [ ] Variables encrypted in Vercel
- [ ] Access keys rotated

### ✅ Authentication

- [ ] Clerk domains configured
- [ ] CORS settings correct
- [ ] Session management working

### ✅ Database

- [ ] RLS policies active
- [ ] Connection pooling configured
- [ ] Backup strategy in place

## Post-Deployment

### ✅ Verification

- [ ] All features working
- [ ] No console errors
- [ ] Performance metrics good
- [ ] Mobile testing completed

### ✅ Documentation

- [ ] README updated
- [ ] Deployment guide complete
- [ ] Troubleshooting docs ready

## Quick Commands

```bash
# Test build locally
npm run build

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Emergency Rollback

If deployment fails:

1. Go to Vercel dashboard
2. Select previous deployment
3. Promote to production
4. Investigate and fix issues
5. Redeploy when ready
