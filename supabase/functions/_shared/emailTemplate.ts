export function buildEmailTemplate(preheader: string, headline: string, bodyContent: string, eyebrow: string = "Notification", headerColor: string = "#26215C"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<title>${headline}</title>
<!--[if mso]>
<style>table {border-collapse:collapse;}</style>
<![endif]-->
<style>
  body, table, td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  body { margin:0; padding:0; width:100% !important; background:#F8F9FA; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  img { border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; color: #1D9E75; font-weight: 500; }
  p { margin:18px 0 0; font-size:16px; line-height:26px; color:#4A4770; }
  .button-wrap { margin-top:32px; display:inline-block; }
  .button { display:inline-block; padding:16px 32px; background:#1D9E75; color:#FFFFFF !important; text-decoration:none; border-radius:12px; font-weight:600; font-size:16px; box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2); }
  .info-card { background:#F3F1FA; border-radius:16px; padding:28px 32px; margin-top:32px; border: 1px solid #E4E1F5; }
  .info-card-label { font-size:12px; color:#8B87B0; font-weight:700; text-transform:uppercase; letter-spacing: 0.5px; margin-bottom:6px; }
  .info-card-value { font-size:18px; font-weight:600; color:#26215C; }
  .chip-approved { display:inline-block; background:#1D9E75; color:#FFFFFF; border-radius:999px; padding:6px 14px; font-size:13px; font-weight:600; }
  .chip-rejected { display:inline-block; background:#E53E3E; color:#FFFFFF; border-radius:999px; padding:6px 14px; font-size:13px; font-weight:600; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; border-radius:0 !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .h1{ font-size:26px !important; line-height:34px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F8F9FA;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#FFFFFF; border-radius:24px; overflow:hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">

  <tr>
    <td style="background:${headerColor}; padding:32px 48px; text-align:left;">
      <span style="font-size:24px; font-weight:800; color:#FFFFFF; letter-spacing:-0.5px;">
        Ralvo
      </span>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:40px 48px 0; text-align:left;">
      <p style="margin:0 0 12px; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:${headerColor};">${eyebrow}</p>
      <h1 class="h1" style="margin:0; font-size:32px; line-height:40px; font-weight:800; color:#26215C; letter-spacing:-0.5px;">${headline}</h1>
      ${bodyContent}
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:40px 48px 48px; border-top:1px solid #F0EEF7; margin-top:48px; text-align:left;">
      <p style="margin:0 0 8px; font-size:13px; color:#8B87B0; line-height:1.6;">Ralvo &bull; Lagos, Nigeria</p>
      <p style="margin:0; font-size:13px; color:#8B87B0; line-height:1.6;">
        <a href="https://www.ralvo.com.ng/dashboard/settings" style="color:#8B87B0; text-decoration:underline;">Notification settings</a>
        &nbsp;&bull;&nbsp;
        <a href="https://www.ralvo.com.ng/faq" style="color:#8B87B0; text-decoration:underline;">Help &amp; FAQ</a>
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;;
}

