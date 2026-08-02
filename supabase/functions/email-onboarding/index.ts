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

    // This is triggered by a pg_cron scheduled job, so no payload is strictly required.
    // Query users created > 24 hours ago, who are volunteers, and haven't set interests or bio
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: incompleteProfiles, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        volunteer_profiles (
          full_name,
          interests,
          bio
        )
      `)
      .eq('role', 'volunteer')
      .lt('created_at', oneDayAgo.toISOString());

    if (error || !incompleteProfiles) {
      throw new Error(`Failed to fetch incomplete profiles: ${error?.message}`);
    }

    const targets = incompleteProfiles.filter((u: any) => {
      // If profile doesn't exist yet, or interests is null/empty, or bio is missing
      const profile = Array.isArray(u.volunteer_profiles) ? u.volunteer_profiles[0] : u.volunteer_profiles;
      if (!profile) return true;
      if (!profile.interests || profile.interests.length === 0) return true;
      if (!profile.bio) return true;
      return false;
    });

    const results = [];
    for (const target of targets) {
      if (!target.email) continue;
      
      const profile = Array.isArray(target.volunteer_profiles) ? target.volunteer_profiles[0] : target.volunteer_profiles;
      const name = profile?.full_name || "Volunteer";

      const subject = "Complete Your SabiHands Profile!";
      
      const bodyText = `
        <p>Hi ${name},</p>
        <p>We noticed you haven't completed your volunteer profile on SabiHands yet.</p>
        <p>Complete your profile to unlock the best gigs. NGOs and companies are looking for real hands like you. Adding your interests and a short bio helps us match you with opportunities you'll actually care about.</p>
        <a href="https://sabihands.com/dashboard/volunteer/settings" class="button">Complete Profile</a>
      `;

      const htmlContent = buildEmailTemplate(
        "Complete Your Profile",
        "We need your details, Sabi Hand!",
        bodyText
      );

      try {
        await sendBrevoEmail(target.email, name, subject, htmlContent);
        results.push({ email: target.email, status: 'success' });
      } catch (e: any) {
        console.error(`Failed to send to ${target.email}:`, e);
        results.push({ email: target.email, status: 'error', error: e.message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: targets.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error running onboarding check:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
