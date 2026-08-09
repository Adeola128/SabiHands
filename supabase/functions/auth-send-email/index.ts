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
    console.log("Auth Hook Payload:", JSON.stringify(payload));

    const { user, email_data } = payload;
    
    if (!user || !user.email || !email_data) {
      console.error("Invalid payload structure", payload);
      return new Response(JSON.stringify({ error: "Invalid payload" }), { headers: corsHeaders, status: 400 });
    }

    const email = user.email;
    const name = user.user_metadata?.full_name || "User";
    const token = email_data.token || "000000";
    const actionType = email_data.email_action_type;

    let subject = "";
    let htmlContent = "";

    if (actionType === "signup") {
      subject = "Confirm your Gigway account";
      htmlContent = getSignupHtml(token);
    } else if (actionType === "recovery") {
      subject = "Reset Your Gigway Password";
      htmlContent = getResetPasswordHtml(token);
    } else if (actionType === "magiclink") {
      subject = "Your Magic Link to Gigway";
      htmlContent = getMagicLinkHtml(token);
    } else {
      // For any other types like email_change or invite, use a generic template or log it
      console.log(`Unhandled email type: ${actionType}. Using fallback.`);
      subject = "Gigway Notification";
      htmlContent = getFallbackHtml(token, actionType);
    }

    // Send email via Brevo API
    const result = await sendBrevoEmail(email, name, subject, htmlContent);
    console.log("Brevo API result:", result);

    // IMPORTANT: The Auth hook MUST return a 200 response for Supabase Auth to proceed.
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in auth-send-email hook:", error);
    // Even if it fails, returning 500 will abort the auth flow, returning the error to the user frontend
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// ------------- TEMPLATES -------------

function getSignupHtml(token: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  body { margin:0; padding:0; width:100% !important; background:#F3F1FA; }
  a { text-decoration:none; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .h1{ font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
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
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#534AB7;">Welcome</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">Confirm your email.</h1>
      <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770;">We are excited to have you join us. Show up. Get sabi. But first, you need to verify your email address to get full access to the platform.</p>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" align="left" style="padding:28px 48px 0;">
      <div style="background:#EEEDFE; padding:16px 24px; border-radius:8px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px;">
        ${token}
      </div>
      <p style="margin:16px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#4A4770;">Enter this 6-digit code on the verification page.</p>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" style="padding:24px 48px 36px; text-align:left; margin-top: 24px; display: block;">
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#8B87B0;">If you didn't request this, you can safely ignore this email.</p>
    </td>
  </tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function getMagicLinkHtml(token: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  body { margin:0; padding:0; width:100% !important; background:#F3F1FA; }
  a { text-decoration:none; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .h1{ font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
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
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#1D9E75;">Login</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">Sign in instantly.</h1>
      <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770;">Ready to jump back in? Enter the code below to log in instantly. No passwords needed.</p>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" align="left" style="padding:28px 48px 0;">
      <div style="background:#EEEDFE; padding:16px 24px; border-radius:8px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px;">
        ${token}
      </div>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" style="padding:24px 48px 36px; text-align:left; margin-top: 24px; display: block;">
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#8B87B0;">If you didn't request this link, you can safely ignore this email.</p>
    </td>
  </tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function getResetPasswordHtml(token: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  body { margin:0; padding:0; width:100% !important; background:#F3F1FA; }
  a { text-decoration:none; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .h1{ font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
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
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#534AB7;">Security</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">Reset your password.</h1>
      <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770;">Forgot your password? No wahala. Enter the code below to securely set a new password and get back to finding gigs.</p>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" align="left" style="padding:28px 48px 0;">
      <div style="background:#EEEDFE; padding:16px 24px; border-radius:8px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px;">
        ${token}
      </div>
    </td>
  </tr>
  <tr>
    <td class="stack-pad" style="padding:24px 48px 36px; text-align:left; margin-top: 24px; display: block;">
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#8B87B0;">If you didn't ask to reset your password, you can safely ignore this email.</p>
    </td>
  </tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function getFallbackHtml(token: string, actionType: string) {
  return `<!DOCTYPE html>
<html>
<body>
  <h2>Gigway Notification</h2>
  <p>Action requested: ${actionType}</p>
  <p>Your code is: <strong>${token}</strong></p>
</body>
</html>`;
}

