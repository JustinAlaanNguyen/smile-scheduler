const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY); 

const sendAppointmentEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'Smile Scheduler <noreply@smile-scheduler.com>',
      to,
      subject,
      html,
    });
    console.log("Email sent")
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = { sendAppointmentEmail };
