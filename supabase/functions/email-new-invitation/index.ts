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

    // Triggered on INSERT to `invitations`
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
      .select('title, organizations(name)')
      .eq('id', record.gig_id)
      .single();

    if (gigError || !gigData) throw new Error("Gig not found");

    const orgName = gigData.organizations?.name || "An organization";

    // Get the volunteer's email and name
    const { data: volUser } = await supabase.from('users').select('email').eq('id', record.volunteer_id).single();
    if (!volUser?.email) throw new Error("Volunteer email not found");

    const { data: volData } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', record.volunteer_id).single();
    const volunteerName = volData?.full_name || "Volunteer";

    const subject = `You've been invited by ${orgName}!`;
    
    const bodyText = `
      <p>Hello ${volunteerName},</p>
      <p><strong>${orgName}</strong> has directly invited you to apply for their gig: <strong>${gigData.title}</strong>.</p>
      <p>They checked out your profile and think you'd be a perfect fit. Don't leave them hanging!</p>
      <a href="https://www.ralvo.com.ng/dashboard/volunteer/gigs/${record.gig_id}" class="button">View Gig & Apply</a>
    `;

    const htmlContent = buildEmailTemplate(
      "You've been invited",
      "You're in demand!",
      bodyText,
      "Invitation",
      "#26215C"
    );

    const result = await sendBrevoEmail(volUser.email, volunteerName, subject, htmlContent);

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
