# 📧 Newsletter Subscription Flow Documentation

## 🎯 Overview

The Second Turn Games newsletter subscription system allows visitors to sign up for launch notifications. The flow is fully automated and includes email notifications to the site owner.

## 🏗️ Architecture

### **Current Implementation (v2.0)**

- **Frontend**: Coming Soon page with email signup form
- **Database**: Supabase `newsletter_subscribers` table
- **Webhook**: Supabase Database Webhook → Vercel API route
- **Email Service**: Resend.com for reliable email delivery
- **Notifications**: Automatic email alerts to site owner

### **Flow Diagram**

```
User Input → Supabase Table → Webhook → Resend.com → Owner Email
```

## 📋 Components

### **1. Frontend (`app/coming-soon/page.tsx`)**

- Mobile-first responsive design
- Email validation and error handling
- Success/error toast notifications
- Duplicate email detection
- Loading states and timeouts

### **2. Database (`supabase/migrations/20241201000001_create_newsletter_subscribers.sql`)**

```sql
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. Webhook (`app/api/webhook/subscription/route.ts`)**

- Receives POST requests from Supabase
- Extracts subscriber email from webhook payload
- Sends notification email via Resend.com
- Logs all activities for debugging

### **4. Email Service (Resend.com)**

- Reliable email delivery
- Professional templates
- Domain verification (secondturn.games)
- Analytics and delivery tracking

## 🔧 Setup Instructions

### **Prerequisites**

1. Supabase project with database access
2. Resend.com account with API key
3. Vercel deployment with environment variables

### **Environment Variables**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend.com)
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your-proton-email@proton.me
```

### **Database Setup**

1. Run the migration: `supabase/migrations/20241201000001_create_newsletter_subscribers.sql`
2. Verify RLS policies are active
3. Test table access from frontend

### **Supabase Webhook Configuration**

1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - **Name**: `subscription-notifications`
   - **Table**: `newsletter_subscribers`
   - **Events**: `INSERT` only
   - **URL**: `https://secondturn.games/api/webhook/subscription`
   - **HTTP Method**: `POST`

### **Resend.com Setup**

1. Sign up at https://resend.com
2. Add and verify domain: `secondturn.games`
3. Generate API key
4. Add environment variables to Vercel

## 🚀 User Experience Flow

### **1. Visitor Lands on Coming Soon Page**

- Sees branded landing page with logo
- Reads description about Second Turn Games
- Views Baltic flags and community focus

### **2. Email Signup Process**

- User enters email address
- Frontend validates email format
- Shows loading state during submission
- Handles duplicate email errors gracefully
- Displays success confirmation

### **3. Backend Processing**

- Email saved to Supabase database
- Supabase webhook triggers automatically
- Webhook sends notification email to owner
- All activities logged for monitoring

### **4. Owner Notification**

- Receives email at configured address
- Email includes subscriber details and timestamp
- Professional HTML template with branding

## 🛡️ Error Handling

### **Frontend Errors**

- **Invalid Email**: Client-side validation with toast
- **Duplicate Email**: User-friendly error message
- **Network Issues**: Timeout handling (10 seconds)
- **Server Errors**: Generic error message for security

### **Backend Errors**

- **Webhook Failures**: Logged to Vercel function logs
- **Email Delivery Issues**: Resend.com handles retries
- **Database Errors**: Supabase error logging

### **Monitoring**

- Vercel function logs for webhook activity
- Supabase dashboard for database activity
- Resend.com dashboard for email delivery status

## 📊 Analytics & Monitoring

### **Key Metrics**

- Total subscribers count
- Daily/weekly signup rates
- Email delivery success rate
- Webhook response times

### **Monitoring Tools**

- **Vercel Analytics**: Page views and performance
- **Supabase Dashboard**: Database activity
- **Resend.com Dashboard**: Email delivery metrics
- **Vercel Function Logs**: Webhook activity

## 🔄 Maintenance

### **Regular Tasks**

- Monitor webhook delivery status
- Check email delivery rates
- Review subscriber growth
- Update email templates if needed

### **Troubleshooting**

- **Webhook not firing**: Check Supabase webhook configuration
- **Emails not sending**: Verify Resend.com API key and domain
- **Database errors**: Check RLS policies and table structure

## 🗑️ Data Management

### **Subscriber Data**

- Stored securely in Supabase
- Protected by Row Level Security
- GDPR compliant with clear privacy policy
- Export functionality available

### **Cleanup Procedures**

- No automatic deletion of subscribers
- Manual cleanup available via Supabase dashboard
- Export data before any cleanup operations

## 🔮 Future Enhancements

### **Potential Improvements**

- Email confirmation flow for subscribers
- Segmentation by location (Baltic countries)
- A/B testing for signup forms
- Integration with marketing tools
- Automated welcome email sequences

### **Scalability Considerations**

- Current setup handles thousands of subscribers
- Resend.com scales automatically
- Supabase handles concurrent webhook requests
- Vercel functions auto-scale as needed

## 📚 Related Documentation

- [CSV to Supabase Sync System](csv-sync-setup.md)
- [Responsive Design Guidelines](responsive-design-guidelines.md)
- [Deployment Guide](deployment-guide.md)

---

**Last Updated**: July 2025  
**Version**: 2.0  
**Status**: Production Ready ✅
