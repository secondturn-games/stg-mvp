import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const client = new SmtpClient()

serve(async (req) => {
  try {
    const { email } = await req.json()

    // Configure SMTP (you can use any email service)
    await client.connectTLS({
      hostname: "smtp.resend.com",
      port: 587,
      username: "resend",
      password: Deno.env.get("RESEND_API_KEY") || "",
    })

    await client.send({
      from: "info@secondturn.games",
      to: Deno.env.get("NOTIFICATION_EMAIL") || "",
      subject: "🎉 New Newsletter Subscription - Second Turn",
      content: `
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
        </div>
      `,
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
        </div>
      `,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}) 