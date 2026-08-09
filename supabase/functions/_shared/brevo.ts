export const sendBrevoEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
) => {
  const apiKey = Deno.env.get("BREVO_API_KEY");

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in the environment.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "Gigway",
        email: "partnership@oratora.com.ng",
      },
      to: [
        {
          email: toEmail,
          name: toName,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email via Brevo: ${errorData}`);
  }

  return await response.json();
};

