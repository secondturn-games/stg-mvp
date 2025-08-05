import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()
    
    // Log the webhook data for debugging
    console.log('📧 Webhook received:', JSON.stringify(body, null, 2))
    
    // Extract the new subscription data
    const { email } = body.record || {}
    
    if (email) {
      console.log(`🎉 New subscription: ${email}`)
      
      // Send email notification using Resend
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const { data, error } = await resend.emails.send({
          from: 'info@secondturn.games',
          to: process.env.NOTIFICATION_EMAIL || 'aigars.grenins@gmail.com',
          subject: '🎉 New Newsletter Subscription - Second Turn',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #29432B;">New Newsletter Subscription!</h2>
              <p>Someone just subscribed to your Second Turn newsletter!</p>
              
              <div style="background-color: #E6EAD7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <strong>Email:</strong> ${email}
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Subscription time: ${new Date().toLocaleString('en-US', { 
                  timeZone: 'Europe/Riga',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This is an automated notification from your Second Turn website.
              </p>
            </div>
          `,
        })
        
        if (error) {
          console.error('❌ Failed to send email notification:', error)
        } else {
          console.log('✅ Email notification sent successfully:', data)
        }
      } catch (error) {
        console.error('❌ Error sending email:', error)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      subscription: email 
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 