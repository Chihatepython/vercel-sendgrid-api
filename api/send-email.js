// api/send-email.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, html } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing fields: to/subject/html' });
    }

    const sent = await resend.emails.send({
      from: 'onboarding@resend.dev', // 本地测试可用
      to,
      subject,
      html,
    });

    return res.status(200).json({ ok: true, id: sent?.id });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: err?.message || 'send failed' });
  }
}