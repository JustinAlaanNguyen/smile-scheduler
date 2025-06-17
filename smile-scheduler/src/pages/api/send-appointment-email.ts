// pages/api/send-appointment-email.ts
import { Resend } from 'resend';

import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body } = req.body;

    const data = await resend.emails.send({
      from: 'noreply@smile-scheduler.com', // Your verified sender
      to,
      subject,
      text: body,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.log("error message:", error)
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
