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

    // Fetch gigs published in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentGigs, error: gigsError } = await supabase
      .from('gigs')
      .select('*, organizations(name)')
      .eq('status', 'published')
      .gte('date_start', sevenDaysAgo.toISOString())
      .limit(5);

    if (gigsError || !recentGigs || recentGigs.length === 0) {
      return new Response(JSON.stringify({ message: "No recent gigs to recommend" }), { headers: corsHeaders, status: 200 });
    }

    // Fetch all volunteers
    const { data: volunteers, error: volError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        volunteer_profiles (
          full_name
        )
      `)
      .eq('role', 'volunteer');

    if (volError || !volunteers || volunteers.length === 0) {
      return new Response(JSON.stringify({ message: "No volunteers to email" }), { headers: corsHeaders, status: 200 });
    }

    let gigHtml = recentGigs.map((gig: any) => `
      <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #E4E1F5; border-radius: 12px; background: #FBFAFF;">
        <h3 style="margin-top:0; color: #26215C; font-family: 'Fraunces', serif;">${gig.title}</h3>
        <p style="margin: 5px 0; font-size: 14px;"><strong>${gig.organizations?.name || 'Organization'}</strong> &bull; ${gig.location || 'Remote'}</p>
        <p style="margin: 5px 0; font-size: 14px;">${gig.type === 'skilled' ? 'Skilled Role' : 'Physical Role'}</p>
        <a href="https://Gigway.com/dashboard/volunteer/gigs/${gig.id}" style="display: inline-block; margin-top: 10px; color: #534AB7; text-decoration: none; font-weight: bold;">View Details &rarr;</a>
      </div>
    `).join('');

    const results = [];
    for (const vol of volunteers) {
      if (!vol.email) continue;
      
      const profile = Array.isArray(vol.volunteer_profiles) ? vol.volunteer_profiles[0] : vol.volunteer_profiles;
      const name = profile?.full_name || "Volunteer";

      const subject = "Your Weekly Gigway Recommendations";
      
      const bodyText = `
        <p>Hi ${name},</p>
        <p>Here are some gigs we think you'll absolutely crush this week. Time to show up and get sabi.</p>
        <br/>
        ${gigHtml}
        <br/>
        <a href="https://Gigway.com/dashboard/volunteer/gigs" class="button">View All Gigs</a>
      `;

      const htmlContent = buildEmailTemplate(
        "Recommended Gigs",
        "Your Weekly Sabi Gigs",
        bodyText
      );

      try {
        await sendBrevoEmail(vol.email, name, subject, htmlContent);
        results.push({ email: vol.email, status: 'success' });
      } catch (e: any) {
        console.error(`Failed to send to ${vol.email}:`, e);
        results.push({ email: vol.email, status: 'error', error: e.message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: volunteers.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending recommendations:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

