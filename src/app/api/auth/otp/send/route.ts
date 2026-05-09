import { NextResponse } from 'next/server';
import { generateOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    const otp = await generateOTP(identifier);

    // Mask identifier for response
    const maskedId = identifier.includes('@') 
      ? identifier.replace(/^(..)(.*)(@.*)$/, '$1***$3')
      : identifier.replace(/\s/g, '').replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3');

    return NextResponse.json({ 
      success: true, 
      message: `OTP sent successfully to ${maskedId}`,
      maskedId
    });
  } catch (error: any) {
    console.error('OTP Send error:', error);
    let message = error.message || 'Internal server error';
    
    // Hide technical SMTP/API errors from the end user
    if (message.includes('CONFIG_MISSING')) {
      message = 'Email service is not configured. Please set a valid GMAIL_APP_PASSWORD in your .env.local file.';
    } else if (message.includes('535') || message.includes('credentials') || message.includes('API key')) {
      message = 'Authentication service is temporarily unavailable. Please try again later.';
    }

    const status = message.includes('Too many requests') ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
