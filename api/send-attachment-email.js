// api/send-attachment-emal.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 简单的扩展名 -> MIME 类型映射（type 可不传，尽量帮你猜）
const mimeMap = {
  csv: 'text/csv',
  txt: 'text/plain',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, attachment, attachments } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing fields: to/subject/html' });
    }

    // 兼容：可以传一个 attachment 对象，或 attachments 数组
    let attList = [];
    if (Array.isArray(attachments)) attList = attachments;
    else if (attachment && typeof attachment === 'object') attList = [attachment];

    // 规范化附件结构：必须有 filename 与 content(Base64)
    const normalized = attList
      .filter(Boolean)
      .map((a) => {
        const filename = a.filename || 'attachment';
        let type = a.type;
        if (!type) {
          const ext = (filename.split('.').pop() || '').toLowerCase();
          type = mimeMap[ext] || 'application/octet-stream';
        }
        return {
          filename,
          content: a.content, // 必须是 Base64
          type,
        };
      });

    // 附件可选；如果你希望必传，取消下面这行的注释做校验：
    // if (!normalized.length) return res.status(400).json({ error: 'Missing attachment(s)' });

    const result = await resend.emails.send({
      // 本地/测试环境可用 Resend 默认地址；生产建议换成你验证过的域名地址
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
      // 没有附件也能发
      attachments: normalized.length ? normalized : undefined,
    });

    return res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('send-attachment-emal error:', err);
    return res
      .status(500)
      .json({ error: err?.response?.data || err?.message || 'send failed' });
  }
}