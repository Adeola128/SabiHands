import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendBrevoEmail } from "../_shared/brevo.ts";

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

    // 1. Verify caller is an admin
    const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Check if caller is admin (allow if role is admin or if they have special permissions)
    // Sometimes user metadata has role instead of profiles table, checking both.
    const isCallerAdmin = callerProfile?.role === 'admin' || user.user_metadata?.role === 'admin';
    if (!isCallerAdmin) {
      throw new Error("You must be an administrator to invite new platform admins.");
    }

    const { email } = await req.json();
    if (!email) throw new Error("Missing email address");

    // 2. Generate invite link via Supabase Admin API
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        data: { role: 'admin' } // Set metadata role to admin upon signup
      }
    });

    if (linkErr) throw linkErr;

    // 3. Update the new user's profile to admin if the user was just created
    if (linkData.user?.id) {
       await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', linkData.user.id);
    }

    const inviteLink = linkData.properties.action_link;
    const subject = `You have been invited as a Platform Administrator on Ralvo`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F9FA; padding: 40px 20px; color: #1E293B; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #0F172A; padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Admin Invitation</h1>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #475569;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">You have been invited to join the <strong>Internal Platform Administration Team</strong> on Ralvo (SabiHands).</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Click the secure link below to accept the invitation, set your password, and access the HQ Dashboard.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${inviteLink}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Accept Admin Invite</a>
            </div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
              <p style="font-size: 13px; color: #64748B; margin: 0;">This link is secure and intended only for you. If you didn't expect this, please ignore it.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Send the email using Brevo
    await sendBrevoEmail(email, "Platform Admin", subject, htmlContent);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error inviting admin:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
