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
    const payload = await req.json();
    console.log("Webhook payload:", payload);

    // This webhook triggers on INSERT to `applications`
    const { record, type } = payload;
    
    if (type !== "INSERT" || !record || !record.gig_id || !record.volunteer_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the gig details and org user
    const { data: gigData, error: gigError } = await supabase
      .from('gigs')
      .select('title, organizations(name, user_id)')
      .eq('id', record.gig_id)
      .single();

    if (gigError || !gigData) throw new Error("Gig not found");

    const orgName = gigData.organizations?.name || "Organization";
    const orgUserId = gigData.organizations?.user_id;

    if (!orgUserId) throw new Error("Org user not found");

    // Get the org's email
    const { data: orgUser } = await supabase.from('users').select('email').eq('id', orgUserId).single();
    if (!orgUser?.email) throw new Error("Organization email not found");

    // Get the volunteer's name
    const { data: volData } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', record.volunteer_id).single();
    const volunteerName = volData?.full_name || "A volunteer";

    const subject = `New Application for ${gigData.title}`;
    
    const bodyText = `
      <p>Hello ${orgName},</p>
      <p>Great news! <strong>${volunteerName}</strong> has just applied for your gig: <strong>${gigData.title}</strong>.</p>
      <p>Log in to your dashboard to review their application, accept or decline, and find the perfect match for your initiative.</p>
      <a href="https://www.ralvo.com.ng/dashboard/organization/applications" class="button">Review Application</a>
    `;

    const htmlContent = buildEmailTemplate(
      "New Application Received",
      "You have a new applicant!",
      bodyText,
      "Application",
      "#1D9E75"
    );

    const result = await sendBrevoEmail(orgUser.email, orgName, subject, htmlContent);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
