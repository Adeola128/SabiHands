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

    const { record, type } = payload;
    
    if (type !== "INSERT" || !record || !record.volunteer_id || !record.gig_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const { volunteer_id, gig_id, verification_code } = record;

    // Fetch Gig and Org Info
    const { data: gigData, error: gigError } = await supabase
      .from('gigs')
      .select('title, organizations(name)')
      .eq('id', gig_id)
      .single();

    if (gigError || !gigData) {
      throw new Error("Gig not found");
    }

    const orgName = gigData.organizations?.name || "Organization";

    // Fetch Volunteer Info
    const { data: volUser } = await supabase.from('users').select('email').eq('id', volunteer_id).single();
    if (!volUser?.email) {
      throw new Error("Volunteer email not found");
    }

    const { data: volData } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', volunteer_id).single();
    const volunteerName = volData?.full_name || "Volunteer";

    const subject = `Your certificate for ${gigData.title} is ready!`;

    const bodyText = `
      <h2 class="headline">Congratulations, Sabi Hand!</h2>
      <p>Hi <strong>${volunteerName}</strong>,</p>
      <p>Your certificate of completion has been officially issued by the organization for your outstanding contributions.</p>
      
      <div class="info-card">
        <div class="info-card-label">Gig Details</div>
        <div class="info-card-value">${gigData.title}</div>
        <div class="info-card-sub">Issued by ${orgName} &bull; Verification Code: ${verification_code || 'N/A'}</div>
      </div>
      
      <p>You can view, share, or download your certificate directly from your dashboard now.</p>
      
      <div class="button-wrap">
        <a href="https://sabihands.vercel.app/dashboard/volunteer/certificates" class="button">View My Certificate</a>
      </div>
    `;

    const htmlContent = buildEmailTemplate(
      "Your volunteer certificate is ready",
      "Certificate Issued",
      bodyText
    );

    const result = await sendBrevoEmail(volUser.email, volunteerName, subject, htmlContent);

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
