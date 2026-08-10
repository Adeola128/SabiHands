// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      subject = "Confirm your Ralvo account";
      htmlContent = getSignupHtml(token);
    } else if (actionType === "recovery") {
      subject = "Reset Your Ralvo Password";
      htmlContent = getResetPasswordHtml(token);
    } else if (actionType === "magiclink") {
      subject = "Your Magic Link to Ralvo";
      htmlContent = getMagicLinkHtml(token);
    } else {
      // For any other types like email_change or invite, use a generic template or log it
      console.log(`Unhandled email type: ${actionType}. Using fallback.`);
      subject = "Ralvo Notification";
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
  const bodyText = `
    <p>We are excited to have you join us. Get verified experience. But first, you need to verify your email address to get full access to the platform.</p>
    <div style="background:#EEEDFE; padding:16px 24px; border-radius:12px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px; margin-top:24px;">
      ${token}
    </div>
    <p style="font-size:14px; margin-top:12px;">Enter this 6-digit code on the verification page.</p>
    <p style="font-size:13px; color:#8B87B0; margin-top:32px;">If you didn't request this, you can safely ignore this email.</p>
  `;
  return buildEmailTemplate(
    "Confirm your email.",
    "Confirm your email.",
    bodyText,
    "Welcome",
    "#1D9E75"
  );
}

function getMagicLinkHtml(token: string) {
  const bodyText = `
    <p>Ready to jump back in? Enter the code below to log in instantly. No passwords needed.</p>
    <div style="background:#EEEDFE; padding:16px 24px; border-radius:12px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px; margin-top:24px;">
      ${token}
    </div>
    <p style="font-size:13px; color:#8B87B0; margin-top:32px;">If you didn't request this link, you can safely ignore this email.</p>
  `;
  return buildEmailTemplate(
    "Sign in instantly.",
    "Sign in instantly.",
    bodyText,
    "Login",
    "#26215C"
  );
}

function getResetPasswordHtml(token: string) {
  const bodyText = `
    <p>Forgot your password? No problem. Enter the code below to securely set a new password and get back to finding gigs.</p>
    <div style="background:#EEEDFE; padding:16px 24px; border-radius:12px; display:inline-block; font-family:Courier, monospace; font-size:28px; font-weight:bold; color:#26215C; letter-spacing:4px; margin-top:24px;">
      ${token}
    </div>
    <p style="font-size:13px; color:#8B87B0; margin-top:32px;">If you didn't ask to reset your password, you can safely ignore this email.</p>
  `;
  return buildEmailTemplate(
    "Reset your password.",
    "Reset your password.",
    bodyText,
    "Security",
    "#E53E3E"
  );
}

function getFallbackHtml(token: string, actionType: string) {
  return `<!DOCTYPE html>
<html>
<body>
  <h2>Ralvo Notification</h2>
  <p>Action requested: ${actionType}</p>
  <p>Your code is: <strong>${token}</strong></p>
</body>
</html>`;
}

