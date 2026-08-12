// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Webhook payload:", payload);

    const { record, old_record, type } = payload;
    
    if (type !== "UPDATE" || !record || !record.user_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    // Only notify if verification_status has changed from pending to verified or rejected
    if (record.verification_status === old_record?.verification_status) {
      return new Response(JSON.stringify({ message: "No verification status change detected" }), { headers: corsHeaders, status: 200 });
    }

    if (record.verification_status !== 'verified' && record.verification_status !== 'rejected') {
      return new Response(JSON.stringify({ message: "Verification status is not verified or rejected" }), { headers: corsHeaders, status: 200 });
    }

    const { name, user_id, rejection_reason } = record;

    // Fetch Org Owner Info
    const { data: orgUser } = await supabase.from('users').select('email').eq('id', user_id).single();
    if (!orgUser?.email) {
      throw new Error("Organization user email not found");
    }

    let subject = "";
    let htmlContent = "";

    if (record.verification_status === 'verified') {
      subject = `Your Ralvo organization profile has been approved!`;
      const bodyText = `
        <h2 class="headline">Congratulations, ${name}!</h2>
        <p>We are delighted to inform you that your organization has been <strong>approved</strong> by the Ralvo review board.</p>
        
        <p>You can now start posting volunteer gigs, recruiting volunteers, reviewing submissions, and issuing certificates to impact makers.</p>
        
        <div class="button-wrap">
          <a href="https://www.ralvo.com.ng/dashboard/organization/gigs/new" class="button">Create Your First Gig</a>
        </div>
        
        <p>Thank you for partnering with us to build a stronger community.</p>
        <p>Best regards,<br>The Ralvo Team</p>
      `;
      htmlContent = buildEmailTemplate(
        "Your organization was approved",
        "Organization Approved",
        bodyText,
        "Verification Update",
        "#1D9E75"
      );
    } else if (record.verification_status === 'rejected') {
      subject = `Action Required: Organization Verification Update`;
      const bodyText = `
        <h2 class="headline">Action required, ${name}.</h2>
        <p>We reviewed your organization verification submission. Unfortunately, we were unable to approve your application at this time based on the documents or video provided.</p>
        
        <div class="info-card" style="border: 1px solid #FECACA; background: #FEF2F2;">
          <div class="info-card-label" style="color: #991B1B;">Reason for rejection</div>
          <div class="info-card-value" style="color: #7F1D1D; font-size: 15px; font-weight: normal; margin-top: 4px;">
            ${rejection_reason || "No specific reason provided."}
          </div>
        </div>
        
        <div class="button-wrap">
          <a href="https://www.ralvo.com.ng/dashboard/organization/settings/verification" class="button" style="background:#DC2626;">Update and Resubmit</a>
        </div>
        
        <p>If you believe this was a mistake, or need further clarification, reply directly to this email to speak with our support team.</p>
        <p>Best regards,<br>The Ralvo Team</p>
      `;
      htmlContent = buildEmailTemplate(
        "Update regarding your organization verification on Ralvo.",
        "Verification Rejected",
        bodyText,
        "Action Required",
        "#DC2626"
      );
    }

    const result = await sendBrevoEmail(orgUser.email, name, subject, htmlContent);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
