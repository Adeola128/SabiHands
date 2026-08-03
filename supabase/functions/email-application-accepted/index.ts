import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const payload = await req.json();
    const { volunteer_email, volunteer_name, gig_title, org_name } = payload;

    if (!volunteer_email || !gig_title || !org_name) {
      throw new Error("Missing required fields in payload");
    }

    if (!BREVO_API_KEY) {
      console.warn("BREVO_API_KEY is not set. Simulating email send.");
      console.log(`[SIMULATED EMAIL TO ${volunteer_email}]`);
      console.log(`Subject: Great news! Your application to ${org_name} was accepted`);
      console.log(`Hi ${volunteer_name}, you have been accepted for the gig: ${gig_title}.`);
      return new Response(JSON.stringify({ success: true, simulated: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Call Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "SabiHands Notifications",
          email: "notifications@sabihands.com"
        },
        to: [
          {
            email: volunteer_email,
            name: volunteer_name
          }
        ],
        subject: `Great news! Your application to ${org_name} was accepted 🎉`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4C1D95;">Congratulations, ${volunteer_name}!</h2>
            <p>We are thrilled to let you know that <strong>${org_name}</strong> has accepted your application for the gig:</p>
            <div style="background-color: #F5F3FF; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0; color: #4C1D95;">${gig_title}</h3>
            </div>
            <p>They will be reaching out to you shortly with next steps and onboarding instructions.</p>
            <p>Thank you for offering your hands and skills to make an impact!</p>
            <br/>
            <p>Best regards,<br/>The SabiHands Team</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", errorText);
      throw new Error("Failed to send email via Brevo");
    }

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, messageId: data.messageId }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
})
