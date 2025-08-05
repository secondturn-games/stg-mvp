# 📧 Subscription System Quick Reference

## 🚀 Quick Setup Checklist

### **Environment Variables**

```env
# Required for production
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your-email@proton.me

# Already configured
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Supabase Webhook Configuration**

- **URL**: `https://secondturn.games/api/webhook/subscription`
- **Table**: `newsletter_subscribers`
- **Events**: `INSERT` only
- **Method**: `POST`

### **Resend.com Setup**

- **Domain**: `secondturn.games` (verified)
- **From Email**: `info@secondturn.games`
- **API Key**: Added to Vercel environment variables

## 🔧 Common Commands

### **Check Subscription Status**

```bash
# View subscribers in Supabase dashboard
# Database → Tables → newsletter_subscribers
```

### **Test Email Flow**

1. Visit: https://secondturn.games
2. Subscribe with test email
3. Check Proton Mail for notification

### **Monitor Webhook Activity**

```bash
# Check Vercel function logs
vercel logs secondturn.games
```

## 📊 Key Metrics

### **Database Table**

- **Name**: `newsletter_subscribers`
- **Columns**: `id`, `email`, `created_at`, `updated_at`
- **Constraints**: Unique email addresses

### **Webhook Endpoint**

- **Path**: `/api/webhook/subscription`
- **Method**: `POST`
- **Response**: JSON with success/error status

### **Email Template**

- **Subject**: "🎉 New Newsletter Subscription - Second Turn"
- **From**: `info@secondturn.games`
- **To**: `NOTIFICATION_EMAIL` environment variable

## 🛠️ Troubleshooting

### **Webhook Not Firing**

- Check Supabase webhook configuration
- Verify URL is correct: `https://secondturn.games/api/webhook/subscription`
- Ensure `INSERT` event is selected

### **Emails Not Sending**

- Verify `RESEND_API_KEY` in Vercel environment variables
- Check domain verification in Resend.com dashboard
- Review Vercel function logs for errors

### **Database Errors**

- Check RLS policies on `newsletter_subscribers` table
- Verify table structure matches migration
- Test table access from Supabase dashboard

## 📈 Monitoring

### **Vercel Dashboard**

- Function logs for webhook activity
- Performance metrics for API routes
- Error tracking and alerts

### **Supabase Dashboard**

- Database activity and queries
- Webhook delivery status
- Table row counts and growth

### **Resend.com Dashboard**

- Email delivery rates
- Bounce and spam reports
- Domain reputation

## 🔄 Maintenance Tasks

### **Weekly**

- Check subscriber growth rate
- Review email delivery success rate
- Monitor webhook response times

### **Monthly**

- Export subscriber data for backup
- Review and update email templates
- Check domain reputation in Resend.com

### **As Needed**

- Update environment variables
- Modify webhook configuration
- Add new monitoring alerts

## 📞 Support

### **Documentation**

- 📖 [Complete Setup Guide](subscription-flow.md)
- 🚀 [Quick Reference](subscription-quick-reference.md)

### **Contact**

- **Email**: info@secondturn.games
- **Repository**: Create issue for technical problems

---

**Last Updated**: July 2025  
**Version**: 2.0  
**Status**: Production Ready ✅
