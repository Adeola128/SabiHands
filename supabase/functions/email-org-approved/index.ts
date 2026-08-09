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
    
    if (type !== "UPDATE" || !record || !record.status || !record.user_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    // Only notify if status changed to approved
    if (record.status === old_record?.status || record.status !== 'approved') {
      return new Response(JSON.stringify({ message: "No action required" }), { headers: corsHeaders, status: 200 });
    }

    const { name, user_id } = record;

    // Fetch Org Owner Info
    const { data: orgUser } = await supabase.from('users').select('email').eq('id', user_id).single();
    if (!orgUser?.email) {
      throw new Error("Organization user email not found");
    }

    const subject = `Your Ralvo organization profile has been approved!`;

    const bodyText = `
      <h2 class="headline">Congratulations, ${name}!</h2>
      <p>We are delighted to inform you that your organization has been <strong>approved</strong> by the Ralvo review board.</p>
      
      <p>You can now start posting volunteer gigs, recruiting Sabi Hands, reviewing submissions, and issuing certificates to impact makers.</p>
      
      <div class="button-wrap">
        <a href="https://Ralvo.vercel.app/dashboard/organization/gigs/new" class="button">Create Your First Gig</a>
      </div>
      
      <p>Thank you for partnering with us to build a stronger community.</p>
      <p>Best regards,<br>The Ralvo Team</p>
    `;

    const htmlContent = buildEmailTemplate(
      "Your organization was approved",
      "Organization Approved",
      bodyText
    );

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

