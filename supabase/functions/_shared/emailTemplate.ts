export function buildEmailTemplate(preheader: string, headline: string, bodyContent: string, eyebrow: string = "Notification", headerColor: string = "#534AB7"): string {
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
  body { margin:0; padding:0; width:100% !important; background:#F3F1FA; }
  img { border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; }
  p { margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4A4770; }
  .button-wrap { margin-top:28px; border-radius:999px; background:#534AB7; display:inline-block; }
  .button { display:inline-block; padding:14px 30px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#FFFFFF !important; text-decoration:none; border-radius:999px; }
  .info-card { background:#EEEDFE; border-radius:14px; padding:28px 32px; margin-top:28px; }
  .info-card-label { font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0; font-weight:bold; text-transform:uppercase; margin-bottom:4px; }
  .info-card-value { font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:bold; color:#26215C; }
  .chip-approved { display:inline-block; background:#1D9E75; color:#FFFFFF; border-radius:999px; padding:4px 12px; font-size:12px; font-weight:bold; }
  .chip-rejected { display:inline-block; background:#E53E3E; color:#FFFFFF; border-radius:999px; padding:4px 12px; font-size:12px; font-weight:bold; }
  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .stack-pad{ padding-left:24px !important; padding-right:24px !important; }
    .h1{ font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F3F1FA;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1FA;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#FFFFFF; border-radius:16px; overflow:hidden;">

  <tr><td style="background:${headerColor}; height:6px; line-height:6px; font-size:6px;">&nbsp;</td></tr>

  <tr>
    <td class="stack-pad" style="padding:36px 48px 0; text-align:left;">
      <span style="font-family:Georgia,'Times New Roman',serif; font-size:20px; font-weight:bold;">
        <span style="color:#534AB7;">Sabi</span><span style="color:#0F6E56;">Hands</span>
      </span>
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:32px 48px 0; text-align:left;">
      <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:${headerColor};">${eyebrow}</p>
      <h1 class="h1" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#26215C;">${headline}</h1>
      ${bodyContent}
    </td>
  </tr>

  <tr>
    <td class="stack-pad" style="padding:28px 48px 40px; border-top:1px solid #EDEBF7; margin-top:36px; text-align:left;">
      <p style="margin:0 0 6px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0; line-height:1.5;">Gigway Â· Lagos, Nigeria</p>
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#8B87B0; line-height:1.5;">
        <a href="https://Gigway.vercel.app/settings" style="color:#8B87B0; text-decoration:underline;">Notification settings</a>
        &nbsp;Â·&nbsp;
        <a href="https://Gigway.vercel.app/help" style="color:#8B87B0; text-decoration:underline;">Help</a>
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;
}

