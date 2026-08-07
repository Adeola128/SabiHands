// @ts-nocheck
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Webhook payload:", payload);

    const { record, type } = payload;
    
    if (type !== "INSERT" || !record || !record.volunteer_id || !record.gig_id) {
       return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const { volunteer_id, gig_id, verification_code, id: certificate_id } = record;

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
    const firstName = volunteerName.split(' ')[0];

    // Fetch total certificates for the volunteer to get completed_gig_count
    let completed_gig_count = 1;
    const { count } = await supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('volunteer_id', volunteer_id);
    if (count !== null) completed_gig_count = count;
    
    const if_plural = completed_gig_count === 1 ? '' : 's';
    
    // Format completion date
    const completionDate = record.created_at ? new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const certificate_url = `https://sabihands.vercel.app/dashboard/volunteer/certificates/${certificate_id}`;

    const subject = `You showed up. Here's your certificate.`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<title>You showed up. Here's your certificate.</title>
<!--[if mso]>
<style>table {border-collapse:collapse;}</style>
<![endif]-->
<style>
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  body { margin:0; padding:0; width:100% !important; background:#F3F1FA; }
  img { border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .cert-pad{ padding:24px !important; }
    .h1{ font-size:24px !important; line-height:32px !important; }
    .cert-name{ font-size:24px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">Your Sabi Hand certificate for ${gigData.title} is ready to view and share.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1FA;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#FFFFFF; border-radius:16px; overflow:hidden;">

  <tr><td style="background:#1D9E75; height:6px; line-height:6px; font-size:6px;">&nbsp;</td></tr>

  <tr>
    <td class="stack-pad" style="padding:36px 48px 0; text-align:left;">
      <span style="font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:bold;">
        <span style="color:#534AB7;">Sabi</span><span style="color:#0F6E56;">Hands</span>
      </span>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:32px 48px 0; text-align:left;">
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#0F6E56;">Certificate issued</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">You showed up. Here's your certificate — you earned it.</h1>
      <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770;">Hi ${firstName}, ${orgName} just confirmed you completed <strong>${gigData.title}</strong>. Your certificate is verified, permanent, and ready to share with anyone — an employer, a school, anyone who asks.</p>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:28px 48px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#26215C; border-radius:14px; text-align:left;">
        <tr>
          <td class="cert-pad" style="padding:32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#AFA9EC;">Certified Sabi Hand</td>
              </tr>
              <tr>
                <td class="cert-name" style="padding-top:14px; font-family:Georgia,'Times New Roman',serif; font-size:28px; font-weight:bold; color:#FFFFFF;">${volunteerName}</td>
              </tr>
              <tr>
                <td style="padding-top:18px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#D8D5F3;">Gig: ${gigData.title} — ${orgName}</td>
              </tr>
              <tr>
                <td style="padding-top:2px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:22px; color:#D8D5F3;">Completed ${completionDate}</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px; border-top:1px solid rgba(255,255,255,0.18);">
              <tr>
                <td style="padding-top:16px; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#5DCAA5;">Verified</td>
                <td style="padding-top:16px; text-align:right; font-family:'Courier New',Courier,monospace; font-size:12px; color:#AFA9EC;">sabihands.ng/verify/${verification_code || 'N/A'}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" align="left" style="padding:30px 48px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius:999px; background:#1D9E75;">
            <a href="${certificate_url}" style="display:inline-block; padding:14px 30px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#04342C; text-decoration:none; border-radius:999px;">View your certificate</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:24px 48px 36px; text-align:left;">
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#8B87B0;">This is ${completed_gig_count} gig${if_plural} certified so far. Every one adds to a record employers can actually check — not just take your word for.</p>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:28px 48px 40px; border-top:1px solid #EDEBF7; text-align:left;">
      <p style="margin:0 0 6px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">SabiHands · Lagos, Nigeria</p>
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">
        <a href="https://sabihands.vercel.app/settings" style="color:#8B87B0; text-decoration:underline;">Notification settings</a>
        &nbsp;·&nbsp;
        <a href="https://sabihands.vercel.app/help" style="color:#8B87B0; text-decoration:underline;">Help</a>
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

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
