// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";
import { buildEmailTemplate } from "../_shared/emailTemplate.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload:", payload);

    const { volunteer_email, volunteer_name, gig_title, org_name } = payload;

    if (!volunteer_email || !gig_title || !org_name) {
      throw new Error("Missing required fields in payload");
    }

    const subject = `Great news! Your application to ${org_name} was accepted`;
    
    const bodyText = `
      <h2 class="headline">Congratulations, ${volunteer_name}!</h2>
      <p>We are thrilled to let you know that your volunteering application has been <strong>officially approved</strong>. Get ready to roll up your sleeves and make a difference!</p>
      
      <div class="info-card">
        <div class="info-card-label">Role Details</div>
        <div class="info-card-value">${gig_title}</div>
        <div class="info-card-sub">Hosted by <strong>${org_name}</strong></div>
      </div>
      
      <p>The organization team will be reaching out to you shortly with next steps, onboarding instructions, and all the details you need to get started.</p>
      
      <div class="button-wrap">
        <a href="https://sabihands.vercel.app/dashboard/volunteer/applications" class="button">View Application Details</a>
      </div>
      
      <p>Thank you for offering your hands and skills to create a positive impact.</p>
      <p>Best regards,<br>The SabiHands Team</p>
    `;

    const htmlContent = buildEmailTemplate(
      "Your application was accepted!",
      "Application Accepted",
      bodyText
    );

    const result = await sendBrevoEmail(volunteer_email, volunteer_name, subject, htmlContent);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
