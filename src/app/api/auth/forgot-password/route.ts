import { NextResponse } from 'next/server';
import { findUserByIdentifier } from '@/lib/users';
import { generateOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    const user = findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email/phone' }, { status: 404 });
    }

    await generateOTP(identifier);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully for password reset' 
    });
  } catch (error: any) {
    console.error('Forgot Password error:', error);
    const message = error.message || 'Internal server error';
    const status = message.includes('Too many requests') ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
