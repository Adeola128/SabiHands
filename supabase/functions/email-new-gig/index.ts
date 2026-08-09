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
    
    if (!record || !record.id || !record.title) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    // Only proceed if it's an INSERT with 'published' status OR an UPDATE that changed status to 'published'
    if (type === "INSERT" && record.status !== "published") {
      return new Response(JSON.stringify({ message: "Gig not published yet" }), { headers: corsHeaders, status: 200 });
    }
    if (type === "UPDATE" && (old_record.status === "published" || record.status !== "published")) {
      return new Response(JSON.stringify({ message: "Not a new publish event" }), { headers: corsHeaders, status: 200 });
    }

    // Fetch the organization name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', record.organization_id)
      .single();

    const orgName = orgData?.name || "An organization";

    // Fetch volunteers (In a real app, you would match by category/location)
    // For this demo, let's just fetch all users with role 'volunteer'
    const { data: volunteers, error: volError } = await supabase
      .from('users')
      .select('email, id')
      .eq('role', 'volunteer')
      .limit(50); // Limit to 50 for safety in this demo

    if (volError || !volunteers || volunteers.length === 0) {
      return new Response(JSON.stringify({ message: "No volunteers to notify" }), { headers: corsHeaders, status: 200 });
    }

    // Prepare email content
    const subject = `New Gig Alert: ${record.title} by ${orgName}`;
    
    const bodyText = `
      <p><strong>${orgName}</strong> just posted a new gig:</p>
      <h2 style="color: #26215C; margin-bottom: 8px;">${record.title}</h2>
      <p>${record.description || ''}</p>
      <p><strong>Location:</strong> ${record.location || 'Remote'}</p>
      <p><strong>Type:</strong> ${record.type}</p>
      <p>A new gig just dropped that perfectly matches your skills. Check it out and be the first to apply.</p>
      <a href="https://Ralvo.com/dashboard/volunteer/gigs/${record.id}" class="button">View Gig</a>
    `;

    const htmlContent = buildEmailTemplate(
      "New Opportunity Available!",
      "New Gig Alert!",
      bodyText
    );

    // Send emails (In production, use Brevo's bulk endpoint or BCC)
    const results = [];
    for (const vol of volunteers) {
      if (vol.email) {
        try {
          const res = await sendBrevoEmail(vol.email, "Volunteer", subject, htmlContent);
          results.push({ email: vol.email, status: 'success' });
        } catch (e: any) {
          console.error(`Failed to send to ${vol.email}:`, e);
          results.push({ email: vol.email, status: 'error', error: e.message });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, notified: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending gig notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

