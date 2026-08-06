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
    
    if (type !== "INSERT" || !record || !record.gig_id || !record.volunteer_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const { gig_id, volunteer_id } = record;

    // Fetch Gig and Org Email
    const { data: gigData, error: gigError } = await supabase
      .from('gigs')
      .select('title, organizations(name, user_id)')
      .eq('id', gig_id)
      .single();

    if (gigError || !gigData) {
      throw new Error("Gig not found");
    }

    const orgUserId = gigData.organizations?.user_id;
    const orgName = gigData.organizations?.name || "Organization";
    
    // Fetch Org Email
    const { data: orgUser } = await supabase.from('users').select('email').eq('id', orgUserId).single();
    if (!orgUser?.email) {
      throw new Error("Org user email not found");
    }

    // Fetch Volunteer Name
    const { data: volData } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', volunteer_id).single();
    const volunteerName = volData?.full_name || "A volunteer";

    const subject = `New Submission Received for ${gigData.title}`;
    
    const bodyText = `
      <h2 class="headline">New Work Submitted!</h2>
      <p>Hello <strong>${orgName}</strong>,</p>
      <p><strong>${volunteerName}</strong> has just submitted their completed work for your gig.</p>
      
      <div class="info-card">
        <div class="info-card-label">Gig Title</div>
        <div class="info-card-value">${gigData.title}</div>
      </div>
      
      <p>Please review their submission as soon as possible to approve or reject their work.</p>
      
      <div class="button-wrap">
        <a href="https://sabihands.vercel.app/dashboard/organization/submissions" class="button">Review Submission</a>
      </div>
    `;

    const htmlContent = buildEmailTemplate(
      "A volunteer submitted work",
      "Submission Received",
      bodyText
    );

    const result = await sendBrevoEmail(orgUser.email, orgName, subject, htmlContent);

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
