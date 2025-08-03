# Supabase Webhook Setup for Email Notifications

## 🎯 **Simplest Solution: Supabase Database Webhooks**

### **Step 1: Create a Webhook Endpoint**

Create a simple webhook endpoint that receives notifications:

```typescript
// app/api/webhook/subscription/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()

    // Verify webhook signature (optional but recommended)
    const signature = headersList.get('x-webhook-signature')

    // Extract the new subscription data
    const { email } = body.record || {}

    if (email) {
      console.log(`🎉 New subscription: ${email}`)

      // Send email notification here
      // You can use any email service: Resend, SendGrid, etc.

      // For now, just log it
      console.log(`📧 Should send notification for: ${email}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
```

### **Step 2: Configure Supabase Webhook**

1. **Go to Supabase Dashboard**
2. **Database → Webhooks**
3. **Create New Webhook**
4. **Configure:**
   - **Name**: `subscription-notifications`
   - **Table**: `newsletter_subscribers`
   - **Events**: `INSERT`
   - **URL**: `https://your-domain.com/api/webhook/subscription`
   - **HTTP Method**: `POST`

### **Step 3: Environment Variables**

Add to your `.env.local`:

```bash
# For email service (example with Resend)
RESEND_API_KEY=your-resend-api-key
NOTIFICATION_EMAIL=your-proton-email@proton.me
```

### **Step 4: Deploy and Test**

1. Deploy to Vercel: `vercel --prod`
2. Add webhook URL to Supabase
3. Test subscription on your site
4. Check webhook logs in Supabase dashboard

## 🔄 **Alternative: Supabase Edge Functions**

If you want more control, use Edge Functions:

1. **Deploy Edge Function** to Supabase
2. **Set up database trigger** to call the function
3. **Function sends email** using any service

## 📊 **Monitoring**

- **Supabase Dashboard**: View webhook logs
- **Vercel Dashboard**: View function logs
- **Email Service**: Check delivery status

## 🎯 **Recommendation**

**Use Database Webhooks** - it's the simplest and most reliable approach. Supabase handles the infrastructure, you just need to create a webhook endpoint!
