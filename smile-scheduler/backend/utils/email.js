const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY); // We'll add this to your .env file next

// Generic function to send an email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: 'Smile Scheduler <noreply@smile-scheduler.com>',
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
