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

    // Expected payload from Database Webhook on insert to `volunteer_profiles`
    const { record, type } = payload;
    
    if (type !== "INSERT" || !record || !record.user_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const { user_id, full_name } = record;

    // Fetch the user's email from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user email:", userError);
      return new Response(JSON.stringify({ error: "User email not found" }), { headers: corsHeaders, status: 500 });
    }

    const email = userData.email;

    // Send Welcome Email
    const subject = "Welcome to Ralvo! You're a Sabi Hand now.";
    
    const bodyText = `
      <p>Welcome, ${full_name}!</p>
      <p>We are thrilled to have you join the Ralvo community as a volunteer. You're not just volunteering. You're a Sabi Hand.</p>
      <p>Start exploring opportunities to make a real impact today. Remember to complete your profile so we can match you with the best gigs!</p>
      <a href="https://Ralvo.com/dashboard" class="button">Go to Dashboard</a>
      <p>Happy Volunteering,<br/>The Ralvo Team</p>
    `;

    const htmlContent = buildEmailTemplate(
      "Welcome to Ralvo!",
      "Welcome, Sabi Hand!",
      bodyText
    );

    const result = await sendBrevoEmail(email, full_name, subject, htmlContent);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

