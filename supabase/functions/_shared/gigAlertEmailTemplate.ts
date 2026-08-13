export interface GigAlertParams {
  gigTitle: string;
  organizationName: string;
  gigType: string;
  gigLocation: string;
  timeNeeded: string;
  description: string;
  whatYouWillDo: string[];
  whatWeAreLookingFor: string[];
  postedRelativeTime: string;
  viewGigUrl: string;
  notificationSettingsUrl: string;
  helpUrl: string;
}

export function buildGigAlertEmailTemplate(params: GigAlertParams): string {
  const {
    gigTitle,
    organizationName,
    gigType,
    gigLocation,
    timeNeeded,
    description,
    whatYouWillDo,
    whatWeAreLookingFor,
    postedRelativeTime,
    viewGigUrl,
    notificationSettingsUrl,
    helpUrl
  } = params;

  const renderBulletList = (items: string[], color: string) => {
    return items.map(item => `
      <tr class="bullet-row">
        <td class="bullet-dot"><span style="background:${color};">&nbsp;</span></td>
        <td class="bullet-text sans-font">${item}</td>
      </tr>
    `).join('');
  };

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>New Gig Alert!</title>
<!--[if mso]>
<style>
  table {border-collapse:collapse;border-spacing:0;margin:0;}
  div, td {padding:0;}
  div {margin:0 !important;}
</style>
<noscript>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
</noscript>
<![endif]-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  /* Base Reset */
  body, p, h1, h2, h3, a, ul, li { margin: 0; padding: 0; }
  body { width: 100% !important; height: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #F1EFFB; color: #4A4770; font-family: 'Inter', Arial, sans-serif; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; max-width: 100%; }
  table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td { mso-line-height-rule: exactly; }
  a { text-decoration: none; color: inherit; }
  
  /* Helpers */
  .display-font { font-family: 'Fraunces', Georgia, serif; }
  .sans-font { font-family: 'Inter', Arial, sans-serif; }
  
  /* Gig Alert Specific */
  .info-grid .info-col { padding: 18px 20px; }
  .bullet-row td { padding: 0 0 12px; vertical-align: top; }
  .bullet-dot { width: 16px; padding-top: 6px !important; }
  .bullet-dot span { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
  .bullet-text { font-size: 14.5px; line-height: 22px; color: #4A4770; padding-left: 12px !important; }

  /* Responsive Utilities */
  @media screen and (max-width: 600px) {
    .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
    .wrapper { padding: 0 !important; }
    .header, .hero, .section, .footer { padding-left: 24px !important; padding-right: 24px !important; }
    .hero h1 { font-size: 26px !important; line-height: 32px !important; }
    .hero-img { width: 100% !important; max-width: 250px !important; margin: 0 auto !important; float: none !important; }
    .info-grid .info-col { display: block !important; width: 100% !important; padding: 14px 20px !important; }
    .info-grid tr .info-col { border-bottom: 1px solid #EDEAFB; border-right: none !important; }
    .info-grid tr:last-child .info-col { border-bottom: none; }
    .btn-wrapper table, .btn-wrapper a { width: 100% !important; text-align: center !important; }
  }
</style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F1EFFB;">
  <div style="display: none; font-size: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
    ${gigTitle} at ${organizationName} — ${gigLocation}, ${gigType}, ~${timeNeeded}. Be first to apply.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <center style="width: 100%; background-color: #F1EFFB; padding-top: 32px; padding-bottom: 32px;" class="wrapper">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1EFFB;">
    <tr>
    <td align="center" valign="top">
    <![endif]-->

    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px -25px rgba(38,33,92,0.25); max-width: 600px;" class="container">
      
      <!-- Header -->
      <tr>
        <td class="header" style="padding: 32px 40px 0; text-align: left;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <img src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786580446/Ralvo_Horizontal_Lockup_1_ljgzj1.png" alt="Ralvo Logo" width="100" style="display: block; width: 100px; max-width: 100px; height: auto;">
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero / alert banner -->
      <tr>
        <td class="hero" style="background-color: #EEEDFE; padding: 24px 40px 0; margin-top: 24px; position: relative; border-radius: 12px; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td class="hero-content" style="text-align: left; padding-bottom: 24px; vertical-align: top;">
                
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;"><tr>
                  <td style="background:#FFFFFF; border-radius:999px; padding:6px 14px 6px 10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                      <td style="width:7px; height:7px; border-radius:50%; background:#1D9E75; line-height:7px; font-size:0;">&nbsp;</td>
                      <td class="sans-font" style="padding-left:7px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; color:#26215C;">New gig alert</td>
                    </tr></table>
                  </td>
                </tr></table>

                <h1 class="display-font" style="font-size: 28px; line-height: 34px; color: #26215C; margin: 0; font-weight: 600;">
                  A new gig just dropped.
                </h1>
                <p class="sans-font" style="font-size: 15px; line-height: 22px; color: #4A4770; margin: 10px 0 0;">
                  It matches what you're looking for — be first to apply.
                </p>
                <p class="sans-font" style="margin:6px 0 0; font-size:12.5px; color:#8B87B0; font-weight: 500;">
                  Posted ${postedRelativeTime}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 0px; text-align: center; vertical-align: bottom;">
                <img class="hero-img" src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786610575/Gemini_Generated_Image_mhucqomhucqomhuc-removebg-preview_zhu3w1.png" alt="Illustration" style="max-width: 240px; width: 100%; height: auto; display: inline-block; margin: 0 auto -5px;">
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Gig details -->
      <tr>
        <td class="section" style="padding: 40px 40px 0;">
          <p class="sans-font" style="margin:0 0 6px; font-size:12px; font-weight:700; color:#8B87B0; text-transform:uppercase; letter-spacing:0.6px;">Posted by ${organizationName}</p>
          <h2 class="display-font" style="margin:0 0 24px; font-size:24px; font-weight:600; color:#26215C;">${gigTitle}</h2>

          <table role="presentation" class="info-grid" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7FD; border-radius:16px; border:1px solid #EDEAFB; margin-bottom: 24px;">
            <tr>
              <td width="33%" class="info-col" style="border-right:1px solid #EDEAFB;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:8px; height:8px; padding:0; border-radius:2px; background:#7F77DD; line-height:8px; font-size:0;">&nbsp;</td></tr></table>
                <span class="sans-font" style="font-size:11px; color:#8B87B0; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; display:block; margin-top:8px;">Type</span>
                <span class="sans-font" style="font-size:15px; font-weight:600; color:#26215C;">${gigType}</span>
              </td>
              <td width="34%" class="info-col" style="border-right:1px solid #EDEAFB;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:8px; height:8px; padding:0; border-radius:2px; background:#1D9E75; line-height:8px; font-size:0;">&nbsp;</td></tr></table>
                <span class="sans-font" style="font-size:11px; color:#8B87B0; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; display:block; margin-top:8px;">Location</span>
                <span class="sans-font" style="font-size:15px; font-weight:600; color:#26215C;">${gigLocation}</span>
              </td>
              <td width="33%" class="info-col">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:8px; height:8px; padding:0; border-radius:2px; background:#5DCAA5; line-height:8px; font-size:0;">&nbsp;</td></tr></table>
                <span class="sans-font" style="font-size:11px; color:#8B87B0; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; display:block; margin-top:8px;">Time needed</span>
                <span class="sans-font" style="font-size:15px; font-weight:600; color:#26215C;">${timeNeeded}</span>
              </td>
            </tr>
          </table>

          <p class="sans-font" style="font-size: 14.5px; line-height: 22px; color: #4A4770; margin-bottom: 24px;">
            ${description}
          </p>

          <h3 class="display-font" style="font-size:18px; color:#26215C; margin:0 0 12px; font-weight:600;">What you'll do</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            ${renderBulletList(whatYouWillDo, '#7F77DD')}
          </table>

          <h3 class="display-font" style="font-size:18px; color:#26215C; margin:0 0 12px; font-weight:600;">What we're looking for</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
            ${renderBulletList(whatWeAreLookingFor, '#1D9E75')}
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
            <tr>
              <td class="btn-wrapper" align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius: 999px; background-color: #534AB7;">
                      <a href="${viewGigUrl}" class="sans-font" style="display: block; padding: 14px 26px; border-radius: 999px; background-color: #534AB7; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14.5px;">View gig &amp; apply &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p class="sans-font" style="text-align:center; font-size:12.5px; color:#8B87B0; margin-bottom: 24px;">Gigs from verified organizations tend to fill within days — worth a look today.</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer" align="center" style="padding: 28px 40px 36px; text-align: center; border-top: 1px solid #F0EEF7;">
          <p class="sans-font" style="font-size: 12px; color: #8B87B0; margin: 0 0 12px; line-height: 18px; max-width: 90%; margin-left: auto; margin-right: auto;">
            You're getting this because your Ralvo profile matches this gig's category. Adjust what you're alerted about anytime.
          </p>
          <p class="sans-font" style="font-size: 12px; color: #8B87B0; margin: 0 0 4px;">Ralvo &bull; Lagos, Nigeria</p>
          <p class="sans-font" style="font-size: 12px; color: #8B87B0; margin: 0;">
            <a href="${notificationSettingsUrl}" style="color: #534AB7; text-decoration: none;">Notification settings</a> &bull; 
            <a href="${helpUrl}" style="color: #534AB7; text-decoration: none;">Help &amp; FAQ</a>
          </p>
        </td>
      </tr>

    </table>

    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`;
}
