const msg = {
  to,
  from: {
    email: "cnqc2249405098@gmail.com", // 👈 直接写死发件人邮箱
    name: "Nutrition Tracker"
  },
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