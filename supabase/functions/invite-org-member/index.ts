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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { email, role, organizationId } = await req.json();

    if (!email || !role || !organizationId) {
      throw new Error("Missing required fields");
    }

    const { data: inviteData, error: inviteError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        invited_email: email.toLowerCase().trim(),
        role: role,
        status: 'pending'
      })
      .select('invite_token')
      .single();

    if (inviteError) {
      if (inviteError.code === '23505') {
        throw new Error("This email has already been invited or is a member of the organization.");
      }
      throw inviteError;
    }

    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();
      
    const orgName = orgData?.name || 'an organization';
    const token = inviteData.invite_token;

    const inviteLink = `https://sabihands.com/join-team?token=${token}`;
    const subject = `You've been invited to join ${orgName} on Ralvo`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F9FA; padding: 40px 20px; color: #1E293B; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #534AB7; padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Team Invitation</h1>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #475569;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">You have been invited to join <strong>${orgName}</strong> as a <strong>${role}</strong> on Ralvo (SabiHands).</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Click the button below to accept the invitation and join your team dashboard.</p>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${inviteLink}" style="display: inline-block; background-color: #534AB7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Accept Invitation</a>
            </div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
              <p style="font-size: 13px; color: #64748B; margin: 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendBrevoEmail(email, "Team Member", subject, htmlContent);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error inviting member:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
