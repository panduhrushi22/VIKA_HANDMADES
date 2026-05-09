import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'your-app-password-here') {
    console.error('[EMAIL] GMAIL_APP_PASSWORD is not configured in .env.local');
    throw new Error('CONFIG_MISSING: Gmail App Password is not configured.');
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  return await transporter.sendMail(mailOptions);
};
