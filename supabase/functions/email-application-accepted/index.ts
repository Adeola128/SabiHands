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
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Application Accepted</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #534AB7; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">SabiHands</h1>
              <p style="color: #E4E1F5; margin: 10px 0 0 0; font-size: 16px;">Make an impact today.</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 700;">Congratulations, ${volunteer_name}! 🎉</h2>
              <p style="margin: 0 0 24px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We are thrilled to let you know that your volunteering application has been <strong>officially approved</strong>. Get ready to roll up your sleeves and make a difference!
              </p>
              
              <!-- Gig Details Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F7FF; border-left: 4px solid #534AB7; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Role Details</p>
                    <h3 style="margin: 0 0 8px 0; color: #534AB7; font-size: 18px; font-weight: 700;">${gig_title}</h3>
                    <p style="margin: 0; color: #4a4a4a; font-size: 15px;">Hosted by <strong>${org_name}</strong></p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                The organization team will be reaching out to you shortly with next steps, onboarding instructions, and all the details you need to get started. 
              </p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://sabihands.vercel.app/dashboard/volunteer/applications" style="display: inline-block; background-color: #0D9488; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; transition: background-color 0.2s;">
                      View Application Details
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for offering your hands and skills to create a positive impact.<br><br>
                Best regards,<br>
                <strong>The SabiHands Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                You received this email because you applied for a volunteering gig on SabiHands.<br>
                &copy; 2024 SabiHands. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
