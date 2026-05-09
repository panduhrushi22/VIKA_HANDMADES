import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { saveMessage } from '@/lib/messages';
import { getSession } from '@/lib/auth';
import { findUserById } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please login to send a message.' }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const { name, message } = await request.json();

    // Validate inputs
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required.' },
        { status: 400 }
      );
    }

    const email = user.email || '';

    // Save to database for admin
    await saveMessage({ name, email, userId: session.userId, message });

    try {
      // Configure Nodemailer with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER,
        replyTo: email,
        subject: `New Contact Form Message from ${name}`,
        text: `
          Name: ${name}
          Email: ${email}
          User ID: ${session.userId}
          Message:
          ${message}
        `,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #FF9A9E;">New Message from Contact Form</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>User ID:</strong> ${session.userId}</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email notification failed, but message was saved:', emailError);
      // We don't throw here so the user gets a success response
    }

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
