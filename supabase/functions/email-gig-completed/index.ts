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

    // Fetch gigs that ended 24 hours ago and status is still 'published' or 'in-progress'
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Using a cron job for this
    const { data: completedGigs, error: gigsError } = await supabase
      .from('gigs')
      .select('*, organizations(name, user_id)')
      .lt('date_end', oneDayAgo.toISOString())
      .in('status', ['published', 'in-progress']);

    if (gigsError || !completedGigs || completedGigs.length === 0) {
      return new Response(JSON.stringify({ message: "No completed gigs to process" }), { headers: corsHeaders, status: 200 });
    }

    const results = [];
    
    for (const gig of completedGigs) {
      const orgUserId = gig.organizations?.user_id;
      if (!orgUserId) continue;

      const { data: orgUser } = await supabase.from('users').select('email').eq('id', orgUserId).single();
      if (!orgUser?.email) continue;

      const orgName = gig.organizations?.name || "Organization";
      const subject = `Your gig "${gig.title}" has ended`;
      
      const bodyText = `
        <p>Hi ${orgName},</p>
        <p>Your gig <strong>${gig.title}</strong> ended recently. It's time to review the volunteers who showed up!</p>
        <p>Please log in to your dashboard to review submissions, mark attendance, and automatically issue verified certificates to your volunteers.</p>
        <a href="https://www.ralvo.com.ng/dashboard/organization/gigs/${gig.id}" class="button">Review & Certify</a>
      `;

      const htmlContent = buildEmailTemplate(
        "Gig Completed",
        "Time to issue certificates!",
        bodyText,
        "Action Required",
        "#1D9E75"
      );

      try {
        await sendBrevoEmail(orgUser.email, orgName, subject, htmlContent);
        results.push({ email: orgUser.email, gigId: gig.id, status: 'success' });
        
        // Optionally update gig status to 'completed' so we don't email again
        await supabase.from('gigs').update({ status: 'completed' }).eq('id', gig.id);
      } catch (e: any) {
        console.error(`Failed to send for gig ${gig.id}:`, e);
        results.push({ email: orgUser.email, gigId: gig.id, status: 'error', error: e.message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error processing completed gigs:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
