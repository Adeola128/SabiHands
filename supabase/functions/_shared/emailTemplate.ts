export function buildEmailTemplate(preheader: string, headline: string, bodyContent: string): string {
  // SVG Logo encoded as base64 or raw string inside an img src using data URI.
  // This is the SabiHands two-arc mark.
  const logoSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" stroke-width="16" stroke-linecap="round"/>
      <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" stroke-width="16" stroke-linecap="round"/>
    </svg>
  `);
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${headline}</title>
  
  <!--[if mso]>
  <style>
    * { font-family: sans-serif !important; }
    h1, h2, h3 { font-family: serif !important; }
  </style>
  <![endif]-->
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500;0,300&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --purple-900: #26215C;
      --purple-600: #534AB7;
      --teal-600: #0F6E56;
      --body: #4A4770;
      --muted: #8B87B0;
      --paper: #FBFAFF;
      --white: #FFFFFF;
    }
    
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background: #FBFAFF;
      color: #4A4770;
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      line-height: 1.6;
    }
    
    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    
    /* Email client overrides */
    table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
    img { -ms-interpolation-mode:bicubic; }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E4E1F5;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 24px;
      margin-bottom: 24px;
    }
    
    .header {
      padding: 32px 32px 16px;
      text-align: center;
    }
    
    .header img {
      width: 60px;
      height: 60px;
      margin-bottom: 16px;
    }
    
    .header h1 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 28px;
      color: #26215C;
      margin: 0;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .body-content {
      padding: 16px 32px 40px;
      font-size: 16px;
      color: #4A4770;
    }
    
    .body-content p {
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #534AB7;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      margin: 16px 0;
      text-align: center;
    }
    
    .footer {
      background-color: #26215C;
      color: #AFA9EC;
      text-align: center;
      padding: 32px;
      font-size: 13px;
    }
    
    .footer a {
      color: #AFA9EC;
      text-decoration: underline;
    }
    
    .hidden-preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    
    @media screen and (max-width: 600px) {
      .email-container {
        border-radius: 0;
        margin: 0;
        border: none;
      }
      .header, .body-content, .footer {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader -->
  <div class="hidden-preheader">${preheader} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
  
  <center style="width: 100%; background-color: #FBFAFF;">
    <div class="email-container">
      
      <!-- Header -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="header">
            <img src="data:image/svg+xml;charset=UTF-8,${logoSvg}" alt="SabiHands Logo" width="60" height="60">
            <h1>${headline}</h1>
          </td>
        </tr>
      </table>
      
      <!-- Body -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="body-content">
            ${bodyContent}
          </td>
        </tr>
      </table>
      
    </div>
    
    <!-- Footer -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
      <tr>
        <td class="footer" style="border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 10px; font-family: 'Fraunces', serif; font-style: italic; font-size: 16px; color: #5DCAA5;">"You're not just volunteering. You're a Sabi Hand."</p>
          <p style="margin: 0;">&copy; 2026 SabiHands, Lagos, Nigeria.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;
}
