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
    if (inviteData.user?.id) {
       await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', inviteData.user.id);
    }

    const token = inviteData.invite_token;
    
    // Use Origin header to construct link
    const origin = req.headers.get('origin') || 'https://ralvo.com';
    const inviteLink = `${origin}/join-team?admin_token=${token}`;
    const subject = `You've been invited as a Platform Admin on Ralvo`;
    
    // Use the premium email template structure
    const htmlContent = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>Admin Invitation</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body, p, h1, h2, h3, a { margin: 0; padding: 0; }
  body { width: 100% !important; height: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #F1EFFB; color: #4A4770; font-family: 'Inter', Arial, sans-serif; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; max-width: 100%; }
  table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td { mso-line-height-rule: exactly; }
  a { text-decoration: none; color: inherit; }
  .display-font { font-family: 'Fraunces', Georgia, serif; }
  .sans-font { font-family: 'Inter', Arial, sans-serif; }
</style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F1EFFB;">
  <center style="width: 100%; background-color: #F1EFFB; padding-top: 32px; padding-bottom: 32px;">
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px -25px rgba(38,33,92,0.25); max-width: 600px;">
      
      <!-- Header -->
      <tr>
        <td style="padding: 32px 40px 0; text-align: left;">
          <img src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786580446/Ralvo_Horizontal_Lockup_1_ljgzj1.png" alt="Ralvo Logo" width="100" style="display: block; width: 100px; max-width: 100px; height: auto;">
        </td>
      </tr>

      <!-- Hero Section -->
      <tr>
        <td style="background-color: #DAD5F7; padding: 24px 40px 32px; margin-top: 24px; position: relative; border-radius: 12px; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
          <h1 class="display-font" style="font-size: 26px; line-height: 32px; color: #26215C; margin: 0; font-weight: 600;">
            Platform Admin Invite
          </h1>
          <p class="sans-font" style="font-size: 15px; line-height: 22px; color: #4A4770; margin: 12px 0 0; max-width: 400px;">
            You have been invited to join Ralvo as a <strong>Platform Admin</strong>. This role grants you access to platform-wide management tools. Accept the invitation to join the internal team.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
            <tr>
              <td align="left">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius: 999px; background-color: #534AB7;">
                      <a href="${inviteLink}" style="border: solid 1px #534AB7; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; line-height: 14px; color: #ffffff; text-decoration: none; padding: 14px 28px; display: inline-block;">
                        Accept Invitation &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer Info -->
      <tr>
        <td style="padding: 24px 40px 32px; text-align: left; background-color: #ffffff;">
          <p class="sans-font" style="font-size: 13px; color: #8F8C9E; margin: 0; line-height: 18px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </td>
      </tr>
      
    </table>
  </center>
</body>
</html>`;

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
      status: 200,
    });
  }
});
