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
    
    if (type !== "UPDATE" || !record || !record.status || !record.volunteer_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    // Only notify if status changed and is either approved or rejected
    if (record.status === old_record?.status || !['approved', 'rejected'].includes(record.status)) {
      return new Response(JSON.stringify({ message: "No status change to notify" }), { headers: corsHeaders, status: 200 });
    }

    const { status, volunteer_id, gig_id } = record;

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

    const subject = `Your submission for ${gigData.title} has been reviewed`;
    
    const chipHtml = status === 'approved' 
      ? '<span class="chip-approved">Approved</span>' 
      : '<span class="chip-rejected">Rejected</span>';

    const reviewMessage = status === 'approved'
      ? `<p>Excellent work! Your submission has been <strong>approved</strong> by the organization. You've earned another milestone as a Sabi Hand.</p>`
      : `<p>Your submission was not approved by the organization. Please check their feedback and revise your submission if needed.</p>`;

    const bodyText = `
      <h2 class="headline">Submission Reviewed</h2>
      <p>Hi <strong>${volunteerName}</strong>,</p>
      
      <div class="info-card">
        <div class="info-card-label">Gig Title</div>
        <div class="info-card-value">${gigData.title}</div>
        <div class="info-card-sub">Hosted by ${orgName} &bull; Status: ${chipHtml}</div>
      </div>
      
      ${reviewMessage}
      
      <div class="button-wrap">
        <a href="https://sabihands.vercel.app/dashboard/volunteer/my-gigs" class="button">View Submission details</a>
      </div>
    `;

    const htmlContent = buildEmailTemplate(
      "Your submission status has changed",
      "Submission Reviewed",
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
