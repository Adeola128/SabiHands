export function buildWelcomeEmailTemplate(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>Welcome to Ralvo</title>
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
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  /* Base Reset */
  body, p, h1, h2, h3, a { margin: 0; padding: 0; }
  body { width: 100% !important; height: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #F1EFFB; color: #4A4770; font-family: 'Inter', Arial, sans-serif; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; max-width: 100%; }
  table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td { mso-line-height-rule: exactly; }
  a { text-decoration: none; color: inherit; }
  
  /* Helpers */
  .display-font { font-family: 'Fraunces', Georgia, serif; }
  .sans-font { font-family: 'Inter', Arial, sans-serif; }
  
  /* Responsive Utilities */
  @media screen and (max-width: 600px) {
    .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
    .wrapper { padding: 0 !important; }
    .header, .hero, .section, .cert-band, .footer { padding-left: 24px !important; padding-right: 24px !important; }
    .hero h1 { font-size: 26px !important; line-height: 32px !important; }
    .hero-img { width: 100% !important; max-width: 250px !important; margin: 0 auto !important; float: none !important; }
    .hero-content { text-align: center !important; }
    .hero-content p { margin: 12px auto 0 !important; }
    .hero-content .btn-wrapper { text-align: center !important; }
    .hero-content .btn-wrapper table { margin: 0 auto !important; }
    .cert-img { max-width: 200px !important; }
  }
</style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F1EFFB;">
  <div style="display: none; font-size: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
    Verified NGOs, real gigs, real proof - let's find your first one.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
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

      <!-- Hero Section -->
      <tr>
        <td class="hero" style="background-color: #DAD5F7; padding: 24px 40px 0; margin-top: 24px; position: relative; border-radius: 12px; border-bottom-left-radius: 0; border-bottom-right-radius: 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <!-- Hero Content -->
              <td class="hero-content" style="text-align: left; padding-bottom: 24px; vertical-align: top;">
                <h1 class="display-font" style="font-size: 30px; line-height: 36px; color: #26215C; margin: 0; font-weight: 600;">
                  Welcome, ${firstName}.<br>You're on your way.
                </h1>
                <p class="sans-font" style="font-size: 15px; line-height: 22px; color: #4A4770; margin: 12px 0 0; max-width: 380px;">
                  Your account is live. Verified NGOs and companies across Lagos are already posting gigs - let's get you matched with your first one.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                  <tr>
                    <td class="btn-wrapper" align="left">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="border-radius: 999px; background-color: #534AB7;">
                            <a href="https://www.ralvo.com.ng/dashboard" class="sans-font btn" style="display: block; padding: 14px 26px; border-radius: 999px; background-color: #534AB7; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14.5px;">Browse open gigs &rarr;</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <!-- Adjusted Hero Image: Centered, smaller max-height so it fits beautifully without taking too much space -->
              <td align="center" style="padding-top: 0px; text-align: center; vertical-align: bottom;">
                <img class="hero-img" src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786579200/ralvo_benchmark_transparent_agtjny.png" alt="Illustration" style="max-width: 280px; width: 100%; height: auto; display: inline-block; margin: 0 auto -5px;">
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- How it works -->
      <tr>
        <td class="section" style="padding: 36px 40px;">
          <p class="sans-font kicker" style="font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #0F6E56; margin: 0 0 8px;">How it works</p>
          <h2 class="display-font" style="font-size: 20px; color: #26215C; margin: 0 0 24px;">Three steps to your first certificate</h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <!-- Step 1 -->
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px solid #F0EEFA;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="30" valign="top" style="padding-right: 16px;">
                      <div class="display-font" style="width: 30px; height: 30px; border-radius: 15px; background-color: #EEEDFE; color: #534AB7; font-weight: 600; font-size: 13.5px; line-height: 30px; text-align: center;">1</div>
                    </td>
                    <td valign="top">
                      <h3 class="sans-font" style="font-size: 14.5px; font-weight: 600; color: #26215C; margin: 0 0 4px;">Find a gig</h3>
                      <p class="sans-font" style="font-size: 13px; color: #4A4770; margin: 0; line-height: 20px;">Browse verified roles from NGOs and companies near you - skilled or physical.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Step 2 -->
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #F0EEFA;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="30" valign="top" style="padding-right: 16px;">
                      <div class="display-font" style="width: 30px; height: 30px; border-radius: 15px; background-color: #EEEDFE; color: #534AB7; font-weight: 600; font-size: 13.5px; line-height: 30px; text-align: center;">2</div>
                    </td>
                    <td valign="top">
                      <h3 class="sans-font" style="font-size: 14.5px; font-weight: 600; color: #26215C; margin: 0 0 4px;">Show up</h3>
                      <p class="sans-font" style="font-size: 13px; color: #4A4770; margin: 0; line-height: 20px;">Apply in a tap. No CV required. The organization picks who joins.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Step 3 -->
            <tr>
              <td style="padding-top: 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="30" valign="top" style="padding-right: 16px;">
                      <div class="display-font" style="width: 30px; height: 30px; border-radius: 15px; background-color: #EEEDFE; color: #534AB7; font-weight: 600; font-size: 13.5px; line-height: 30px; text-align: center;">3</div>
                    </td>
                    <td valign="top">
                      <h3 class="sans-font" style="font-size: 14.5px; font-weight: 600; color: #26215C; margin: 0 0 4px;">Get certified</h3>
                      <p class="sans-font" style="font-size: 13px; color: #4A4770; margin: 0; line-height: 20px;">The moment you're done, a verified certificate lands in your account.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Cert Band -->
      <tr>
        <td class="cert-band" align="center" style="background-color: #E1F5EE; padding: 32px 40px;">
          <img class="cert-img" src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786579224/ravlo_qejhad.png" alt="Team collaborating" style="max-width: 220px; width: 100%; height: auto; margin: 0 auto;">
          <h2 class="display-font" style="font-size: 19px; color: #26215C; margin: 20px 0 0;">This is what you're working toward</h2>
          <p class="sans-font" style="font-size: 13.5px; line-height: 20px; color: #4A4770; margin: 8px auto 0; max-width: 380px;">
            Every completed gig earns a verified certificate - real proof, not just a line on a CV nobody can check.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer" align="center" style="padding: 28px 40px 36px; text-align: center;">
          <p class="sans-font" style="font-size: 12px; color: #26215C; font-weight: 600; margin: 0 0 12px;">Questions? Just reply - a real person reads these.</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 12px;">
            <tr>
              <td style="padding: 0 6px;">
                <a href="#" class="sans-font" style="font-size: 12px; color: #8B87B0; text-decoration: none;">Instagram</a>
              </td>
              <td style="color: #8B87B0; font-size: 12px;">&bull;</td>
              <td style="padding: 0 6px;">
                <a href="#" class="sans-font" style="font-size: 12px; color: #8B87B0; text-decoration: none;">LinkedIn</a>
              </td>
              <td style="color: #8B87B0; font-size: 12px;">&bull;</td>
              <td style="padding: 0 6px;">
                <a href="#" class="sans-font" style="font-size: 12px; color: #8B87B0; text-decoration: none;">X</a>
              </td>
            </tr>
          </table>

          <p class="sans-font" style="font-size: 12px; color: #8B87B0; margin: 0 0 4px;">Ralvo &bull; Lagos, Nigeria</p>
          <p class="sans-font" style="font-size: 12px; color: #8B87B0; margin: 0;">
            <a href="#" style="color: #534AB7; text-decoration: none;">Unsubscribe</a> &bull; 
            <a href="https://www.ralvo.com.ng" style="color: #534AB7; text-decoration: none;">ralvo.com.ng</a>
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
