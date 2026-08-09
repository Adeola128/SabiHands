// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const payload = await req.json();
    console.log("Webhook payload:", payload);

    const { volunteer_email, volunteer_name, gig_title, org_name, gig_date, gig_location, gig_url } = payload;

    if (!volunteer_email || !gig_title || !org_name) {
      throw new Error("Missing required fields in payload");
    }

    const subject = `You're in â€” ${gig_title} is yours`;
    
    // Extract first name
    const firstName = volunteer_name ? volunteer_name.split(' ')[0] : 'there';
    
    // Provide fallbacks for date and location if not in payload
    const displayDate = gig_date || 'TBD';
    const displayLocation = gig_location || 'Remote';
    const displayUrl = gig_url || 'https://Ralvo.vercel.app/dashboard/volunteer/gigs';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<title>You're in â€” ${gig_title} is yours</title>
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
    .h1{ font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${org_name} accepted your application for ${gig_title}. Here's what happens next.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1FA;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#FFFFFF; border-radius:16px; overflow:hidden;">

  <tr><td style="background:#534AB7; height:6px; line-height:6px; font-size:6px;">&nbsp;</td></tr>

  <tr>
    <td class="stack-pad" style="padding:36px 48px 0; text-align:left;">
      <span style="font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:bold;">
        <span style="color:#534AB7;">Sabi</span><span style="color:#0F6E56;">Hands</span>
      </span>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:32px 48px 0; text-align:left;">
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#534AB7;">Application accepted</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">You're in, ${firstName}.</h1>
      <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770;"><strong>${org_name}</strong> reviewed your application and picked you for the gig. Here's everything you need before you show up.</p>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:28px 48px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEEDFE; border-radius:14px; text-align:left;">
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:bold; color:#26215C;">${gig_title}</td></tr>
              <tr><td style="padding-top:6px; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#4A4770;">${org_name}</td></tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px; border-top:1px solid #D6D2F2;">
              <tr>
                <td style="padding-top:16px; width:50%; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">DATE &amp; TIME<br>
                  <span style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#26215C; font-weight:bold;">${displayDate}</span>
                </td>
                <td style="padding-top:16px; width:50%; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">LOCATION<br>
                  <span style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#26215C; font-weight:bold;">${displayLocation}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" align="left" style="padding:28px 48px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius:999px; background:#534AB7;">
            <a href="${displayUrl}" style="display:inline-block; padding:14px 30px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#FFFFFF; text-decoration:none; border-radius:999px;">View gig details</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:24px 48px 36px; text-align:left;">
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#8B87B0;">Show up, get the gig confirmed by ${org_name}, and your certificate is issued automatically â€” no extra steps.</p>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:28px 48px 40px; border-top:1px solid #EDEBF7; text-align:left;">
      <p style="margin:0 0 6px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">Ralvo Â· Lagos, Nigeria</p>
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0;">
        <a href="https://Ralvo.vercel.app/settings" style="color:#8B87B0; text-decoration:underline;">Notification settings</a>
        &nbsp;Â·&nbsp;
        <a href="https://Ralvo.vercel.app/help" style="color:#8B87B0; text-decoration:underline;">Help</a>
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

    const result = await sendBrevoEmail(volunteer_email, volunteer_name, subject, htmlContent);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

