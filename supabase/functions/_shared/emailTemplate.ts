export function buildEmailTemplate(preheader: string, headline: string, bodyContent: string): string {
  const logoSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" stroke-width="16" stroke-linecap="round"/>
      <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" stroke-width="16" stroke-linecap="round"/>
    </svg>
  `);
  
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${headline}</title>
  <!--[if mso]><style>* { font-family: sans-serif !important; } h1,h2,h3 { font-family: serif !important; }</style><![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    html,body{margin:0 auto!important;padding:0!important;height:100%!important;width:100%!important;background:#F0EFFE;color:#4A4770;font-family:'Inter',Helvetica,Arial,sans-serif;line-height:1.6}
    *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt!important;mso-table-rspace:0pt!important}
    img{-ms-interpolation-mode:bicubic}
    .outer-wrapper{width:100%;background:#F0EFFE;padding:32px 0 48px}
    .email-container{max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(38,33,92,0.12)}
    .header-banner{background:linear-gradient(135deg,#1B1747 0%,#3D359E 45%,#0B5E48 100%);padding:48px 40px 44px;text-align:center}
    .header-logo{width:68px;height:68px;margin-bottom:18px}
    .header-wordmark{color:#FFFFFF;font-family:'Fraunces',Georgia,serif;font-size:34px;font-weight:600;letter-spacing:-0.03em;margin:0 0 6px;line-height:1}
    .header-tagline{color:rgba(255,255,255,0.65);font-size:13px;font-weight:500;margin:0 0 22px;letter-spacing:0.01em}
    .header-badge{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#FFFFFF;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:7px 18px;border-radius:99px}
    .body-content{padding:40px 40px 36px}
    .headline{font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:600;color:#1B1747;margin:0 0 16px;letter-spacing:-0.02em;line-height:1.2}
    .body-content p{font-size:16px;color:#4A4770;line-height:1.75;margin:0 0 20px}
    .info-card{background:#F7F5FF;border:1px solid #DDD9F5;border-left:5px solid #534AB7;border-radius:10px;padding:20px 24px;margin:24px 0}
    .info-card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#8B87B0;margin:0 0 8px}
    .info-card-value{font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:600;color:#1B1747;margin:0 0 6px;line-height:1.2}
    .info-card-sub{font-size:14px;color:#6B68A0;margin:0}
    .button-wrap{text-align:center;padding:8px 0 4px}
    .button{display:inline-block;background:linear-gradient(135deg,#3D359E 0%,#5DCAA5 100%);color:#FFFFFF!important;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 6px 20px rgba(83,74,183,0.35)}
    hr.divider{border:none;border-top:1px solid #EAE8F8;margin:32px 0}
    .chip-approved{display:inline-block;background:#D0F8ED;color:#0B5E48;font-size:13px;font-weight:700;padding:4px 14px;border-radius:99px}
    .chip-rejected{display:inline-block;background:#FDE8E8;color:#9B1C1C;font-size:13px;font-weight:700;padding:4px 14px;border-radius:99px}
    .footer{background:#1B1747;padding:36px 40px;text-align:center}
    .footer-tagline{font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:17px;color:#5DCAA5;margin:0 0 14px;line-height:1.4}
    .footer-copy{font-size:12px;color:#6B68A0;margin:0;line-height:1.6}
    .footer-copy a{color:#AFA9EC;text-decoration:none}
    .hidden-preheader{display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden}
    @media screen and (max-width:600px){
      .outer-wrapper{padding:0!important}
      .email-container{border-radius:0!important;box-shadow:none!important}
      .header-banner,.body-content,.footer{padding-left:24px!important;padding-right:24px!important}
      .headline{font-size:24px!important}
      .header-wordmark{font-size:28px!important}
    }
  </style>
</head>
<body>
  <!-- Preheader -->
  <div class="hidden-preheader">${preheader} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <div class="outer-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="header-banner">
        <img class="header-logo" src="data:image/svg+xml;charset=UTF-8,${logoSvg}" alt="SabiHands">
        <div class="header-wordmark">SabiHands</div>
        <div class="header-tagline">Making an impact, one sabi hand at a time.</div>
        <span class="header-badge">${headline}</span>
      </div>

      <!-- Body -->
      <div class="body-content">
        ${bodyContent}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-tagline">"You're not just volunteering. You're a Sabi Hand."</p>
        <p class="footer-copy">
          &copy; 2026 SabiHands, Lagos, Nigeria.&nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="https://sabihands.vercel.app">Visit Website</a>&nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="https://sabihands.vercel.app/privacy">Privacy Policy</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}
