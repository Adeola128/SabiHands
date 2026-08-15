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

    // Get gigs that are active and have upcoming deadlines (within 48h)
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: gigs, error: gigsError } = await supabase
      .from('gigs')
      .select('id, title, date_end, organization_id')
      .eq('status', 'published')
      .lte('date_end', in48Hours.toISOString())
      .gt('date_end', now.toISOString());

    if (gigsError) throw gigsError;

    let emailsSent = 0;

    for (const gig of gigs || []) {
      const gigDeadline = new Date(gig.date_end);
      const is24h = gigDeadline.getTime() <= in24Hours.getTime();
      const reminderType = is24h ? '24h' : '48h';

      // Get accepted applications that haven't received this specific reminder
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select(`
          id, 
          email_reminders_sent, 
          volunteer_id,
          profiles:profiles!volunteer_id (full_name, email)
        `)
        .eq('gig_id', gig.id)
        .eq('status', 'accepted');

      if (appError) continue;

      for (const app of applications || []) {
        const sentReminders = Array.isArray(app.email_reminders_sent) ? app.email_reminders_sent : [];
        if (sentReminders.includes(reminderType)) continue;

        const volunteerEmail = app.profiles?.email;
        const volunteerName = app.profiles?.full_name || 'Volunteer';

        if (!volunteerEmail) continue;

        const subject = `Reminder: ${gig.title} deadline is approaching!`;
        const timeStr = is24h ? '24 hours' : '48 hours';
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reminder: Gig Deadline Approaching</title>
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F9FA; margin: 0; padding: 40px 20px; color: #1E293B;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              
              <!-- Header -->
              <div style="background-color: #534AB7; padding: 32px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Action Required</h1>
              </div>

              <!-- Content -->
              <div style="padding: 40px;">
                <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #475569;">Hi \${volunteerName},</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                  This is a quick reminder that the deadline for <strong>\${gig.title}</strong> is coming up in less than <strong>\${timeStr}</strong>.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #534AB7; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;">
                    Please ensure you complete your deliverables on time or communicate with the organization if you need an extension.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://sabihands.com/dashboard/volunteer/gigs/\${gig.id}" style="display: inline-block; background-color: #534AB7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(83, 74, 183, 0.2);">View Gig Details</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #F8FAFC; padding: 24px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0; font-size: 14px; color: #64748B;">
                  Thank you for volunteering and making a difference with SabiHands!
                </p>
              </div>

            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 12px; color: #94A3B8;">&copy; \${new Date().getFullYear()} SabiHands. All rights reserved.</p>
            </div>
          </body>
          </html>
        `;

        try {
          await sendBrevoEmail(volunteerEmail, volunteerName, subject, htmlContent);
          
          // Update database
          await supabase
            .from('applications')
            .update({ email_reminders_sent: [...sentReminders, reminderType] })
            .eq('id', app.id);
            
          emailsSent++;
        } catch (emailError) {
          console.error("Failed to send email to", volunteerEmail, emailError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error triggering reminders:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
