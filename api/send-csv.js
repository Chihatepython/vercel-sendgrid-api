// api/send-csv.js  —— Vercel Serverless (ESM 版本)
import sgMail from "@sendgrid/mail";

// 读取环境变量
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM;

// 可选：启动时做个提示，避免忘配环境变量
if (!SENDGRID_API_KEY || !FROM_EMAIL) {
  console.error("Missing SENDGRID_API_KEY or SENDGRID_FROM env.");
}

sgMail.setApiKey(SENDGRID_API_KEY);

export default async function handler(req, res) {
  // ---- CORS ----
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // 保护性解析：有些平台 body 可能还是字符串
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, text, filename, content } = body;

    if (!to || !filename || !content) {
      return res.status(400).json({ error: "Missing fields: to/filename/content" });
    }

    const msg = {
      to,
      from: { email: FROM_EMAIL, name: "Nutrition Tracker" }, // 必须是已验证的发件人
      subject: subject || "Your Nutrition Log",
      text: text || "Hi! Here’s your nutrition log CSV.",
      attachments: [
        { content, filename, type: "text/csv", disposition: "attachment" }
      ],
    };

    const [sgRes] = await sgMail.send(msg);
    return res.status(200).json({ ok: true, status: sgRes?.statusCode });
  } catch (err) {
    // 打印 SendGrid 的详细错误
    console.error("SENDCSV error:", err?.response?.body || err);
    return res.status(500).json({ error: err?.response?.body || { message: "SendGrid failed" } });
  }
}