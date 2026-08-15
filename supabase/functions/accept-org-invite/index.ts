import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) throw new Error("No authorization header");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
    });

    // 1. Get the user from the auth token
    const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { token } = await req.json();
    if (!token) throw new Error("Missing invite token");

    // 2. Fetch the invite securely using Service Key
    const { data: inviteData, error: inviteErr } = await supabaseAdmin
      .from('organization_members')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (inviteErr || !inviteData) throw new Error("Invalid or expired invitation");
    if (inviteData.status === 'active') throw new Error("This invitation has already been accepted");

    // 3. Verify email matches
    if (inviteData.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
      throw new Error("This invitation was sent to a different email address.");
    }

    // 4. Update the member row
    const { error: updateErr } = await supabaseAdmin
      .from('organization_members')
      .update({
        user_id: user.id,
        status: 'active',
        invite_token: null // Clear token after use
      })
      .eq('id', inviteData.id);

    if (updateErr) throw updateErr;

    // 5. Update user's profile role to 'organization'
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'organization' })
      .eq('id', user.id);
      
    // Ignore profile error if it's already updated or doesn't matter

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error accepting invite:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
