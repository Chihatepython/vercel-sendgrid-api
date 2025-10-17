// api/send-csv.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // === 允许跨域 CORS ===
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { to, subject, text, filename, content } = req.body || {};
    if (!to || !filename || !content) {
      return res.status(400).json({ error: "Missing fields: to/filename/content" });
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM || "Nutrition Tracker <no-reply@yourdomain.com>",
      subject: subject || "Your Nutrition Log",
      text: text || "Hi! Here’s your nutrition log CSV.",
      attachments: [
        {
          content,
          filename,
          type: "text/csv",
          disposition: "attachment"
        }
      ]
    };

    const [response] = await sgMail.send(msg);
    return res.status(200).json({ ok: true, status: response.statusCode });
  } catch (err) {
    console.error("SendGrid error:", err?.response?.body || err);
    const msg = err?.response?.body || { message: "SendGrid failed" };
    return res.status(500).json({ error: msg });
  }
}