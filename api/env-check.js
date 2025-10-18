export default function handler(req, res) {
  const key = process.env.RESEND_API_KEY;
  res.status(200).json({
    hasKey: Boolean(key),
    preview: key ? key.slice(0, 7) + '…' : null, // 只回显前几位
  });
}