# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with automatic preview and production deployments.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Set up all required environment variables

### Environment Variables

Set these environment variables in your Vercel project:

#### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### Clerk Authentication

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key

#### Clerk URLs (Optional - defaults provided)

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL (default: `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Redirect after sign-in (default: `/`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Redirect after sign-up (default: `/profile/setup`)

### Deployment Setup

#### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Configure Environment Variables**:
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add all required environment variables
   - Set them for Production, Preview, and Development

3. **Deploy**:
   - Push to `main` branch for production deployment
   - Push to `develop` branch for preview deployment
   - Create pull requests for automatic preview deployments

#### Option 2: Manual Deployment

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### GitHub Actions Integration

The project includes GitHub Actions workflows for automated deployments:

- **Preview Deployments**: Triggered on PRs and pushes to `develop` branch
- **Production Deployments**: Triggered on pushes to `main` branch

#### Required GitHub Secrets

Set these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Environment Strategy

#### Development Environment

- **Branch**: `develop`
- **URL**: `https://your-project-git-develop-yourusername.vercel.app`
- **Purpose**: Testing new features

#### Production Environment

- **Branch**: `main`
- **URL**: `https://your-project.vercel.app`
- **Purpose**: Live application

### Database Setup

1. **Supabase Database**:
   - Ensure your Supabase project is set up
   - Run all migrations
   - Configure RLS policies

2. **Clerk Authentication**:
   - Set up your Clerk application
   - Configure allowed origins in Clerk dashboard
   - Add your Vercel domains to Clerk

### Monitoring and Analytics

#### Vercel Analytics

- Enable Vercel Analytics in your project dashboard
- Monitor Core Web Vitals
- Track performance metrics

#### Error Monitoring

- Consider integrating Sentry for error tracking
- Monitor API function execution times
- Set up alerts for failed deployments

### Performance Optimization

1. **Image Optimization**:
   - Use Next.js Image component
   - Configure image domains in `next.config.js`
   - Optimize image formats (WebP, AVIF)

2. **Caching**:
   - Configure Vercel edge caching
   - Use ISR (Incremental Static Regeneration)
   - Implement proper cache headers

3. **Bundle Optimization**:
   - Monitor bundle size with `@next/bundle-analyzer`
   - Implement code splitting
   - Optimize third-party dependencies

### Security Considerations

1. **Environment Variables**:
   - Never commit secrets to version control
   - Use Vercel's environment variable encryption
   - Rotate keys regularly

2. **CORS Configuration**:
   - Configure allowed origins in Clerk
   - Set up proper CORS headers for API routes

3. **Database Security**:
   - Use RLS policies in Supabase
   - Implement proper authentication checks
   - Validate all user inputs

### Troubleshooting

#### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Check environment variables are set

2. **Runtime Errors**:
   - Check Vercel function logs
   - Verify database connections
   - Test authentication flow

3. **Performance Issues**:
   - Monitor Core Web Vitals
   - Check bundle size
   - Optimize images and assets

#### Debug Commands

```bash
# Local build test
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Format checking
npm run format:check
```

### Rollback Strategy

1. **Vercel Rollback**:
   - Use Vercel dashboard to rollback to previous deployment
   - Each deployment is versioned automatically

2. **Database Rollback**:
   - Keep database migration backups
   - Test rollback procedures in staging

### Cost Optimization

1. **Vercel Plan**:
   - Start with Hobby plan for development
   - Upgrade to Pro for production features

2. **Database Costs**:
   - Monitor Supabase usage
   - Optimize queries to reduce bandwidth
   - Use connection pooling

### Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
